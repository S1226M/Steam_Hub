import React, { useState } from "react";
import "./PremiumUpgradeModal.css";

const PremiumUpgradeModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "monthly",
      name: "1 Month",
      price: 5,
      originalPrice: 8,
      savings: "38%",
      features: [
        "Ad-free experience",
        "Offline downloads",
        "4K video quality",
        "Exclusive content",
        "Priority support",
      ],
      popular: false,
    },
    {
      id: "semiannual",
      name: "6 Months",
      price: 30,
      originalPrice: 48,
      savings: "38%",
      features: [
        "Ad-free experience",
        "Offline downloads",
        "4K video quality",
        "Exclusive content",
        "Priority support",
        "Early access to features",
      ],
      popular: true,
    },
    {
      id: "annual",
      name: "12 Months",
      price: 60,
      originalPrice: 96,
      savings: "38%",
      features: [
        "Ad-free experience",
        "Offline downloads",
        "4K video quality",
        "Exclusive content",
        "Priority support",
        "Early access to features",
        "Custom themes",
        "Family sharing (up to 5 accounts)",
      ],
      popular: false,
    },
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = () => {
    if (selectedPlan) {
      console.log("Upgrading to plan:", selectedPlan);
      // Add payment processing logic here
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="premium-modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upgrade to Premium</h2>
          <p>Unlock unlimited access to premium features and content</p>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="plans-container">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${
                selectedPlan === plan.id ? "selected" : ""
              } ${plan.popular ? "popular" : ""}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                  Most Popular
                </div>
              )}

              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="price-container">
                  <span className="price">${plan.price}</span>
                  <span className="original-price">${plan.originalPrice}</span>
                  <span className="savings">Save {plan.savings}</span>
                </div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`select-plan-btn ${
                  selectedPlan === plan.id ? "selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelect(plan.id);
                }}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button
            className="upgrade-btn"
            disabled={!selectedPlan}
            onClick={handleUpgrade}
          >
            Upgrade Now - $
            {plans.find((p) => p.id === selectedPlan)?.price || 0}
          </button>
          <p className="terms">
            By upgrading, you agree to our Terms of Service and Privacy Policy.
            Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
