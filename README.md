# Retail-Banking-AML-Transaction-Monitoring
Retail Banking &amp; AML Transaction Monitoring is a data-driven system designed to help banks detect, investigate, and prevent money laundering, fraud, terrorist financing, and other suspicious financial activities across retail banking transactions.

**PROBLEM**  
Banks process thousands of transactions every day.  Manually identifying suspicious transactions is difficult.  Our system automatically:  ✓ Monitors transactions ✓ Detects suspicious patterns ✓ Calculates risk scores ✓ Generates AML alerts ✓ Helps employees investigate alerts ✓ Allows administrators to configure AML rules.

**SOlution**
OUR SOLUTION  Customer   
       ↓  
Bank Transaction    
      ↓ 
AML Monitoring    
      ↓ 
Risk Analysis   
      ↓ 
Suspicious Alert    
      ↓ 
Compliance Employee    
     ↓ 
Review / Freeze / Resolve

**Frontend**
retail-banking-aml-frontend/
│
├── package.json
├── index.html
├── .env.example
├── README.md
│
└── src/
    │
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    │
    ├── api/
    │   └── api.js
    │
    ├── utils/
    │   ├── auth.js
    │   └── downloadStatement.js
    │
    ├── components/
    │   ├── Layout.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── StatCard.jsx
    │   ├── AlertBadge.jsx
    │   └── Loading.jsx
    │
    └── pages/
        │
        ├── Login.jsx
        ├── Register.jsx
        │
        ├── customer/
        │   ├── CustomerDashboard.jsx
        │   ├── Account.jsx
        │   └── Transactions.jsx
        │
        ├── employee/
        │   ├── EmployeeDashboard.jsx
        │   ├── Alerts.jsx
        │   └── AlertDetails.jsx
        │
        └── admin/
            └── AdminRules.jsx
