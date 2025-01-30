import uuid 
from datetime import datetime
from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_KEY
from loguru import logger

# Initialise Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_order_reference():
    """
    Generates a unique order reference using timestamp and UUID.
    Format: ORD-{YYYYMMDD}-{ShortUUID}
    Example: ORD-20250129-AB12CD34
    """
    short_uuid = str(uuid.uuid4())[:8].upper()  # Take first 8 chars of UUID
    today_date = datetime.now().strftime("%Y%m%d")  # Format: YYYYMMDD
    return f"ORD-{today_date}-{short_uuid}"

def get_payments():

    try:
        response = supabase.table("checkout_payments").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching payments: {repr(e)}")
        return None

# def insert_payment(
#     payment_id,
#     event_id,
#     event_type, 
#     amount, 
#     currency, 
#     email,
#     processed_on, 
#     response_code, 
#     response_summary, 
#     additional_notes
# ):

#     order_ref = generate_order_reference() 

#     try:
#         payment = {
#             "payment_id": payment_id,
#             "event_id": event_id,
#             "order_ref": order_ref,  
#             "event_type": event_type,
#             "amount": amount,
#             "currency": currency,
#             "email": email,
#             "processed_on": processed_on,
#             "response_code": response_code,
#             "response_summary": response_summary,
#             "additional_notes": additional_notes,
#         }

#         logger.info(f" Inserting payment: {payment}")
#         response = supabase.table("checkout_payments").insert(payment).execute()

#         if response.status_code == 201:
#             logger.success(f" Payment {payment_id} inserted successfully with Order Ref: {order_ref}")
#             return {"order_ref": order_ref, "payment_id": payment_id}  #
#         else:
#             logger.error(f" Failed to insert payment - Status: {response.status_code}, Response: {response}")
#             return None

#     except Exception as e:
#         logger.error(f" Error inserting payment: {repr(e)}")
#         return None