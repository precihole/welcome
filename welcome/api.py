import frappe
from frappe.defaults import set_user_default
from frappe.utils import nowdate


DAILY_ROCKET_KEY = "welcome_rocket_last_shown_on"


@frappe.whitelist(methods=["POST"])
def claim_daily_rocket():
	"""Allow the logged-in user to see the welcome rocket once per server day."""
	user = frappe.session.user

	if not user or user == "Guest":
		return {"show": False, "reason": "guest"}

	today = nowdate()

	# Serializes simultaneous tabs/devices for this user before checking the marker.
	if not frappe.db.get_value("User", user, "name", for_update=True):
		return {"show": False, "reason": "user_not_found"}

	last_shown_on = frappe.db.get_value(
		"DefaultValue",
		{"parent": user, "defkey": DAILY_ROCKET_KEY},
		"defvalue",
		order_by="modified desc",
	)

	if last_shown_on == today:
		return {"show": False, "reason": "already_shown", "shown_on": last_shown_on}

	set_user_default(DAILY_ROCKET_KEY, today, user=user)

	return {"show": True, "shown_on": today}
