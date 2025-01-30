CREATE TABLE checkout_payments (
    payment_id TEXT, -- payment id
    event_id TEXT PRIMARY KEY, -- webhook event id
    order_ref TEXT, -- order reference 
    event_type TEXT, -- webhook event type 
    amount TEXT, -- payment amount -> minor currency unit
    currency TEXT, 
    email TEXT,
    processed_on TIMESTAMP,
    response_code TEXT,
    response_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    additional_notes TEXT 
);

--Initial Test 

-- INSERT INTO checkout_payments (
--     payment_id,
--     event_id, 
--     order_ref, 
--     event_type, 
--     amount, 
--     currency, 
--     email, 
--     processed_on, 
--     response_code, 
--     response_summary, 
--     additional_notes
-- )
-- VALUES (
--     'test_payment_id',
--     'test_event_id',
--     'ORDER_00000',
--     'test',
--     10000,
--     'GBP',
--     'test_email@google.com',
--     now(),
--     'test_response_code',
--     'test_response_summary',
--     'test notes'
-- );
