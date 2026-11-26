"""Regional Emergency Services Configuration.

Maps ISO 3166-1 alpha-2 region codes to their primary national emergency
telephone numbers, secondary services (e.g. state ambulances), and emergency
descriptors.
"""

from typing import Any, Dict, Optional


# Region mapping with verified official government / emergency services documentation:
#
# IN (India):
#   - Primary Emergency Number: 112 (National Emergency Response Support System - ERSS)
#   - Secondary/Ambulance: 108 (Emergency Medical Ambulance Services operated across multiple Indian states)
#   - Official Government Reference: Ministry of Home Affairs Emergency Response Support System (ERSS)
#   - URL: https://112.gov.in/ (Accessed: 2026-11-26)
#
# GB / UK (United Kingdom):
#   - Primary Emergency Number: 999 (also 112)
#   - Official Reference: NHS UK - When to call 999
#   - URL: https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/ (Accessed: 2026-11-26)
#
# US (United States):
#   - Primary Emergency Number: 911
#   - Official Reference: National 911 Program (NHTSA, U.S. Department of Transportation)
#   - URL: https://www.911.gov/ (Accessed: 2026-11-26)
#
# AU (Australia):
#   - Primary Emergency Number: 000 (Triple Zero)
#   - Official Reference: Australian Government Department of Home Affairs - Triple Zero
#   - URL: https://www.triplezero.gov.au/ (Accessed: 2026-11-26)
#
# CA (Canada):
#   - Primary Emergency Number: 911
#   - Official Reference: Canadian Radio-television and Telecommunications Commission (CRTC) - 9-1-1 services
#   - URL: https://crtc.gc.ca/eng/phone/911/ (Accessed: 2026-11-26)

DEFAULT_REGION = "IN"

REGIONS_MAP: Dict[str, Dict[str, Any]] = {
    "IN": {
        "country": "India",
        "emergency_number": "112",
        "ambulance_number": "108",
        "emergency_facility": "nearest emergency department or hospital casualty",
        "urgent_care_descriptor": "urgent care clinic, local primary health centre, or 104 medical helpline",
    },
    "GB": {
        "country": "United Kingdom",
        "emergency_number": "999",
        "ambulance_number": "999",
        "emergency_facility": "nearest emergency department (A&E)",
        "urgent_care_descriptor": "urgent treatment centre, NHS 111, or same-day GP",
    },
    "US": {
        "country": "United States",
        "emergency_number": "911",
        "ambulance_number": "911",
        "emergency_facility": "nearest hospital emergency room (ER)",
        "urgent_care_descriptor": "urgent care clinic or same-day primary care physician",
    },
    "AU": {
        "country": "Australia",
        "emergency_number": "000",
        "ambulance_number": "000",
        "emergency_facility": "nearest hospital emergency department",
        "urgent_care_descriptor": "urgent care clinic or local GP",
    },
    "CA": {
        "country": "Canada",
        "emergency_number": "911",
        "ambulance_number": "911",
        "emergency_facility": "nearest emergency department (ER)",
        "urgent_care_descriptor": "walk-in clinic, 811 health line, or urgent GP",
    },
}


def get_region_info(region_code: Optional[str]) -> Dict[str, Any]:
    """Retrieve emergency information for a given region code, falling back to default (IN)."""
    if not region_code or not isinstance(region_code, str):
        return REGIONS_MAP[DEFAULT_REGION]
    code = region_code.strip().upper()
    if code == "UK":
        code = "GB"
    return REGIONS_MAP.get(code, REGIONS_MAP[DEFAULT_REGION])


def get_emergency_number(region_code: Optional[str]) -> str:
    """Return the primary emergency telephone number for the region, falling back to default (112)."""
    return get_region_info(region_code)["emergency_number"]
