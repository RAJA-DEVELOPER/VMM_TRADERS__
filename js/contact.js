/**
 * VMM TRADERS — contact.js
 * Form validation and submission handling
 */

'use strict';

VMM.register('ContactModule', {
  init() {
    this.form = document.getElementById('contact-form-el');
    if (!this.form) return;

    this.inputs = this.form.querySelectorAll('input, textarea');
    this.submitBtn = document.getElementById('btn-submit');

    this._bindEvents();
  },

  _bindEvents() {
    this.form.addEventListener('submit', (e) => this._handleSubmit(e));
    this.form.addEventListener('reset', () => {
      // Clear errors after native reset
      setTimeout(() => {
        this.inputs.forEach(input => this._clearError(input));
      }, 0);
    });
    
    this.inputs.forEach(input => {
      input.addEventListener('blur', () => this._validateField(input));
      input.addEventListener('input', () => this._clearError(input));
      input.addEventListener('change', () => this._clearError(input));
    });
  },

  _validateField(input) {
    const type = input.getAttribute('data-validate');
    const isRequired = input.required || input.getAttribute('aria-required') === 'true';
    let isValid = true;
    let errorMsg = '';

    if (isRequired && !input.value.trim() && input.type !== 'checkbox') {
      isValid = false;
      errorMsg = 'This field is required.';
    } else if (input.type === 'checkbox' && isRequired && !input.checked) {
      isValid = false;
      errorMsg = 'You must agree to the terms.';
    } else if (type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        errorMsg = 'Please enter a valid email address.';
      }
    } else if (type === 'phone' && input.value) {
      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
      if (!phoneRegex.test(input.value)) {
        isValid = false;
        errorMsg = 'Please enter a valid phone number.';
      }
    }

    if (!isValid) {
      this._showError(input, errorMsg);
    } else {
      this._clearError(input);
    }

    return isValid;
  },

  _showError(input, message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    
    let container = input.type === 'checkbox' ? input.closest('.contact-form__consent') : input.closest('.form-group--float');
    if (!container) container = input.parentNode;
    
    let errorEl = container.querySelector('.error-msg');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-msg';
      errorEl.style.color = '#ef4444';
      errorEl.style.fontSize = '0.75rem';
      errorEl.style.marginTop = '4px';
      errorEl.style.display = 'block';
      errorEl.style.fontWeight = '500';
      
      container.appendChild(errorEl);
    }
    errorEl.textContent = message;
  },

  _clearError(input) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    
    let container = input.type === 'checkbox' ? input.closest('.contact-form__consent') : input.closest('.form-group--float');
    if (!container) container = input.parentNode;
    
    const errorEl = container.querySelector('.error-msg');
    if (errorEl) {
      errorEl.remove();
    }
  },

  _handleSubmit(e) {
    e.preventDefault();
    if (this.submitBtn.disabled) return;

    let isFormValid = true;
    this.inputs.forEach(input => {
      if (!this._validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      const firstInvalid = this.form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Morph button into loading state
    this.submitBtn.disabled = true;
    const originalText = this.submitBtn.innerHTML;
    const originalWidth = this.submitBtn.offsetWidth;
    this.submitBtn.style.width = `${originalWidth}px`; // Maintain width
    
    this.submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" style="width: 24px; height: 24px; animation: rotate 2s linear infinite;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="90, 150" stroke-dashoffset="0" style="animation: dash 1.5s ease-in-out infinite;"></circle>
      </svg>
      Sending...
    `;

    // Add inline keyframes if not present
    if (!document.getElementById('spinner-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spinner-keyframes';
      style.textContent = `
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        @keyframes dash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }
      `;
      document.head.appendChild(style);
    }

    // Simulate API call
    setTimeout(() => {
      // Morph into success state
      this.submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 24px; height: 24px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Sent Successfully
      `;
      this.submitBtn.style.backgroundColor = '#22c55e';
      this.submitBtn.style.borderColor = '#22c55e';
      
      setTimeout(() => {
        // Reset to original state
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalText;
        this.submitBtn.style.width = '';
        this.submitBtn.style.backgroundColor = '';
        this.submitBtn.style.borderColor = '';
        this.form.reset();
        this.form.dispatchEvent(new CustomEvent('vmm:submit:success'));
      }, 2000);
    }, 1500);
  },
});
