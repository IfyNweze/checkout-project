import os
import hmac
import hashlib
from flask import Blueprint, request, jsonify
from app.supabase_utils import supabase
from dotenv import load_dotenv
from loguru import logger

# Load environment variables
load_dotenv()
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET") 

# Initialise Blueprint for the webhook
webhook = Blueprint("webhook", __name__)

# Logging setup
logger.add("webhook_logs.log", rotation="1 day")

def verify_signature(request):
    """Validate webhook signature using HMACSHA256."""
    provided_signature = request.headers.get("Cko-Signature")
    
    if not provided_signature:
        logger.warning(" Missing webhook signature header")
        return False

    # Ensure request body is not empty before computing HMAC
    request_body = request.data or b""
    
    try:
        # Compute expected HMAC signature
        calculated_hmac = hmac.new(
            WEBHOOK_SECRET.encode(), 
            request_body,
            hashlib.sha256
        ).hexdigest()

        # Debugging: Log expected vs received signature
        logger.debug(f"🔍 Expected Signature: {calculated_hmac}")
        logger.debug(f"🔍 Received Signature: {provided_signature.lower()}")

        # Compare signatures securely (convert both to lowercase)
        if hmac.compare_digest(provided_signature.lower(), calculated_hmac.lower()):
            logger.info("Webhook signature is valid")
            return True
        else:
            logger.warning(" Invalid webhook signature")
            return False
    except Exception as e:
        logger.error(f"⚠️ Error verifying signature: {e}")
        return False


def get_event_count(event_id):
    """Query Supabase to count occurrences of the event_id."""
    try:
        result = supabase.table("checkout_payments").select("event_id", count="exact").eq("event_id", event_id).execute()

        # Check if Supabase response contains a count
        if hasattr(result, "count"):  
            return result.count  # Correct way to get count

        # Alternative check if Supabase response is a dictionary
        if isinstance(result, dict) and "count" in result:
            return result["count"]  

    except Exception as e:
        logger.error(f" Error checking duplicate event_id {event_id}: {e}")
    
    return 0  # Default to 0 if the query fails

# def get_ordinal_suffix(n):
#     """Helper to return ordinal suffix (e.g., 'st', 'nd', 'rd', 'th')."""
#     if 11 <= n % 100 <= 13:
#         return "th"
#     return {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")

# def prepare_additional_notes(event_id):
#     """Generate additional notes for duplicate events."""
#     count = get_event_count(event_id)
#     if count > 0:
#         suffix = get_ordinal_suffix(count)
#         return f"This is the {count}{suffix} duplicate of the event. Only here for testing purposes."
#     return None  

### 🔹 Webhook Handler
@webhook.route("/webhook", methods=["POST"])
def handle_webhook():
    """Securely handle incoming webhooks from Checkout.com and update Supabase."""
    
    # Log the incoming request
    logger.info(" Received webhook request")
    
    if not verify_signature(request):
        logger.warning(" Unauthorized webhook request")
        return jsonify({"message": "Unauthorized request"}), 403 

    # Parse webhook JSON
    data = request.json
    logger.debug(f"Webhook Data: {data}")

    # Extract key fields
    payment_id = data["data"].get("id", "unknown_id")
    order_ref = data["data"].get("metadata", {}).get("order_ref", None) 
    event_type = data.get("type", "unknown_event")
    amount = data["data"].get("amount", 0)
    currency = data["data"].get("currency", "unknown_currency")
    email = data["data"].get("customer", {}).get("email", "unknown_email")
    processed_on = data["data"].get("processed_on", data.get("timestamp", "unknown_timestamp"))
    response_code = data["data"].get("response_code", "unknown_code")
    response_summary = data["data"].get("response_summary", "unknown_summary")

    # Determine status based on event type
    if event_type == "payment_approved":
        status = "approved"
    elif event_type == "payment_declined":
        status = "declined"
    elif event_type == "payment_captured":
        status = "captured"
    elif event_type == "payment_voided":
        status = "voided"
    elif event_type == "payment_refunded":
        status = "refunded"
    else:
        status = "pending"

    try:
        response = supabase.table("checkout_payments").insert({
            "payment_id": payment_id,  
            "order_ref": order_ref,  
            "event_id": data.get("id", "unknown_event"),
            "event_type": event_type,
            "amount": amount,
            "currency": currency,
            "email": email,
            "processed_on": processed_on,
            "response_code": response_code,
            "response_summary": response_summary,
            "status": status  
        }).execute()

        logger.success(f" Payment {payment_id} ({status}) stored successfully")
        return jsonify({"message": "Webhook processed successfully"}), 200
    except Exception as e:
        logger.error(f"⚠️ Error updating payment in Supabase: {e}")
        return jsonify({"message": "Failed to process webhook", "error": str(e)}), 500
