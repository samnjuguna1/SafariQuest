/**
 * Restaurant Order Checkout with M-Pesa Integration
 * Handles order confirmation, M-Pesa STK push, and Supabase order storage
 */

(function () {
  'use strict';

  const LS_KEY = 'sq_pending_restaurant_order';
  const SUPABASE_URL = 'https://cbyipmrozqsntojiartw.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieWlwbXJvenFzbnRvamlhcnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTkxNTQsImV4cCI6MjA4ODk3NTE1NH0.31TAhmUCV_Uh0W8FGnR2_TLCZDU4YBM1U5LMSMc5JZs';

  // ✅ Single source of truth for the Edge Function base URL
  const MPESA_EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

  // ─── Phone helpers ────────────────────────────────────────────────────────

  function validatePhone(phone) {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
    return /^(07|01)\d{8}$/.test(cleaned) || /^254(7|1)\d{8}$/.test(cleaned);
  }

  function normalizePhone(phone) {
    let cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    return cleaned;
  }

  // ─── Toast / status ───────────────────────────────────────────────────────

  function showToast(message, type = 'info') {
    const statusMsg = document.getElementById('rqStatusMessage');
    if (!statusMsg) return;

    statusMsg.textContent = message;
    statusMsg.style.display = 'block';

    const styles = {
      success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
      error:   { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
      warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
      info:    { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
    };
    const s = styles[type] || styles.info;
    statusMsg.style.backgroundColor = s.bg;
    statusMsg.style.color           = s.color;
    statusMsg.style.border          = `1px solid ${s.border}`;
  }

  function hideToast() {
    const statusMsg = document.getElementById('rqStatusMessage');
    if (statusMsg) statusMsg.style.display = 'none';
  }

  // ─── Button state ─────────────────────────────────────────────────────────

  function setButtonLoading(button, loading, originalText = 'Confirm order') {
    button.disabled     = loading;
    button.textContent  = loading ? 'Processing...' : originalText;
    button.style.opacity = loading ? '0.7' : '1';
  }

  // ─── Supabase helpers ─────────────────────────────────────────────────────

  async function saveOrderToSupabase(orderData) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Supabase save error: ${err}`);
    }

    const result = await response.json();
    return result[0];
  }

  async function updateOrderStatus(orderId, status, paymentRef = null) {
    const updateData = { status };
    if (paymentRef) updateData.payment_ref = paymentRef;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error('Failed to update order status');
    return true;
  }

  // ─── M-Pesa STK push ──────────────────────────────────────────────────────

  async function initiateMpesaStkPush(phone, amount, orderReference) {
    // ✅ Calls your Supabase Edge Function directly
    const url = `${MPESA_EDGE_BASE}/mpesa-stk-push`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        phone:            normalizePhone(phone),
        amount:           Math.round(amount),
        accountReference: orderReference,
        transactionDesc:  `Restaurant Order - ${orderReference}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'STK push failed' }));
      throw new Error(error.error || 'STK push request failed');
    }

    return response.json();
  }

  // ─── Payment status polling ───────────────────────────────────────────────

  async function pollPaymentStatus(checkoutRequestId, orderId, maxAttempts = 30) {
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        // ✅ Uses same Edge Function base URL
        const response = await fetch(
          `${MPESA_EDGE_BASE}/mpesa-stk-push?checkoutRequestId=${checkoutRequestId}`,
          {
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` },
          }
        );

        const data = await response.json();

        if (data.status === 'completed' || data.status === 'paid') {
          clearInterval(pollInterval);
          await updateOrderStatus(orderId, 'completed', data.mpesaReceiptNumber || data.payment_ref);
          showToast('Payment confirmed! Order received.', 'success');
          setTimeout(clearOrderAndCart, 3000);

        } else if (data.status === 'failed' || data.status === 'cancelled') {
          clearInterval(pollInterval);
          await updateOrderStatus(orderId, 'failed');
          showToast('Payment failed or cancelled. Please try again.', 'error');
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          showToast('Payment confirmation pending. Check "My Bookings" for status.', 'warning');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  }

  // ─── Clear / reset ────────────────────────────────────────────────────────

  function clearOrderAndCart() {
    try {
      const order = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      localStorage.removeItem(LS_KEY);
      if (order.restaurantSlug) {
        localStorage.removeItem(`sq_cart_${order.restaurantSlug}`);
      }
    } catch (e) {
      console.error('Error clearing order:', e);
    }

    const panel = document.getElementById('restaurantOrderCheckout');
    if (panel) panel.hidden = true;

    const mpesaPhoneField = document.getElementById('rqMpesaPhoneField');
    if (mpesaPhoneField) mpesaPhoneField.style.display = 'none';

    const phoneInput = document.getElementById('rqMpesaPhone');
    if (phoneInput) phoneInput.value = '';

    const methodSelect = document.getElementById('rqPaymentMethod');
    if (methodSelect) methodSelect.value = 'cash';

    const noteInput = document.getElementById('rqPaymentNote');
    if (noteInput) noteInput.value = '';

    hideToast();
  }

  // ─── Order handlers ───────────────────────────────────────────────────────

  async function handleMpesaOrder(order, phone, note) {
    const button = document.getElementById('rqConfirmBtn');

    if (!phone) {
      showToast('Please enter your M-Pesa phone number.', 'error');
      document.getElementById('rqMpesaPhone').focus();
      return;
    }

    if (!validatePhone(phone)) {
      showToast('Please enter a valid phone number (07XXXXXXXX or 2547XXXXXXXX).', 'error');
      document.getElementById('rqMpesaPhone').focus();
      return;
    }

    setButtonLoading(button, true);
    hideToast();

    try {
      const timestamp      = Date.now();
      const orderReference = `Table ${order.tableNumber} - ${order.customerName} - ${timestamp}`;

      const orderData = {
        customer_name:        order.customerName,
        table_number:         order.tableNumber,
        restaurant_name:      order.restaurantName,
        restaurant_slug:      order.restaurantSlug,
        items:                order.items,
        amount:               order.totalAmount,
        payment_method:       'M-Pesa',
        phone_number:         normalizePhone(phone),
        status:               'pending_payment',
        order_reference:      orderReference,
        special_instructions: note || null,
        created_at:           new Date().toISOString(),
      };

      showToast('Sending payment request to your phone...', 'info');

      // 1️⃣  Trigger STK push
      const stkResponse = await initiateMpesaStkPush(phone, order.totalAmount, orderReference);
      showToast('STK push sent. Enter PIN on your phone.', 'success');

      // 2️⃣  Save order to Supabase (status = pending_payment)
      const savedOrder = await saveOrderToSupabase(orderData);

      // 3️⃣  Start polling for payment confirmation
      if (stkResponse.CheckoutRequestID && savedOrder?.id) {
        pollPaymentStatus(stkResponse.CheckoutRequestID, savedOrder.id);
      }

    } catch (error) {
      console.error('M-Pesa order error:', error);
      showToast(error.message || 'STK push failed. Please try again.', 'error');
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function handleCashOrder(order, note) {
    const button = document.getElementById('rqConfirmBtn');
    setButtonLoading(button, true);
    hideToast();

    try {
      const timestamp      = Date.now();
      const orderReference = `Table ${order.tableNumber} - ${order.customerName} - ${timestamp}`;

      const orderData = {
        customer_name:        order.customerName,
        table_number:         order.tableNumber,
        restaurant_name:      order.restaurantName,
        restaurant_slug:      order.restaurantSlug,
        items:                order.items,
        amount:               order.totalAmount,
        payment_method:       'Cash/Card',
        phone_number:         order.customerPhone || null,
        status:               'pending_payment',
        order_reference:      orderReference,
        special_instructions: note || null,
        created_at:           new Date().toISOString(),
      };

      await saveOrderToSupabase(orderData);
      showToast('Order confirmed! Pay at the table when your food arrives.', 'success');
      setTimeout(clearOrderAndCart, 2000);

    } catch (error) {
      console.error('Cash order error:', error);
      showToast('Failed to save order. Please try again.', 'error');
    } finally {
      setButtonLoading(button, false);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  window.RestaurantOrderCheckout = {
    handleMpesaOrder,
    handleCashOrder,
    clearOrderAndCart,
  };

})();