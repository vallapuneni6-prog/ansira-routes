mysql -h localhost -u root -p srv1_voucher_app_db << 'EOF'
DROP TABLE IF EXISTS service_records;
DROP TABLE IF EXISTS customer_packages;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS package_templates;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS outlets;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS invoices;

CREATE TABLE outlets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    gstin VARCHAR(15) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    outlet_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE package_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    package_value DECIMAL(10, 2) NOT NULL,
    service_value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customer_packages (
    id VARCHAR(255) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    package_template_id VARCHAR(255) NOT NULL,
    outlet_id VARCHAR(255) NOT NULL,
    assigned_date DATE NOT NULL,
    remaining_service_value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vouchers (
    id VARCHAR(255) PRIMARY KEY,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_mobile VARCHAR(20) NOT NULL,
    outlet_id VARCHAR(255) NOT NULL,
    issue_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    redeemed_date TIMESTAMP NULL,
    status ENUM('Issued', 'Redeemed', 'Expired') NOT NULL,
    type ENUM('Partner', 'Family & Friends') NOT NULL,
    discount_percentage INT NOT NULL,
    bill_no VARCHAR(255) NOT NULL,
    redemption_bill_no VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE service_records (
    id VARCHAR(255) PRIMARY KEY,
    customer_package_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_value DECIMAL(10, 2) NOT NULL,
    redeemed_date DATE NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE staff (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    role VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE invoices (
    id VARCHAR(255) PRIMARY KEY,
    invoice_no VARCHAR(255),
    outlet_id VARCHAR(255),
    total DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (id, username, password_hash, role, outlet_id) VALUES 
('u-admin', 'admin', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL);
EOF
