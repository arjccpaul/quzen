export interface CategoryTemplate {
  name: string;
  avgDurationMinutes: number;
  description: string;
}

export const SECTOR_CATEGORIES: Record<string, CategoryTemplate[]> = {
  DIAGNOSTIC: [
    { name: 'Blood Test', avgDurationMinutes: 15, description: 'CBC, lipid, sugar panels' },
    { name: 'Urine / Stool Test', avgDurationMinutes: 10, description: 'Routine urine & stool analysis' },
    { name: 'X-Ray', avgDurationMinutes: 20, description: 'Digital X-Ray imaging' },
    { name: 'ECG / EEG', avgDurationMinutes: 15, description: 'Cardiac & brain wave recording' },
    { name: 'Ultrasound / Sonography', avgDurationMinutes: 30, description: 'Abdominal, pelvic, thyroid scans' },
    { name: 'MRI Scan', avgDurationMinutes: 45, description: 'Magnetic resonance imaging' },
    { name: 'CT Scan', avgDurationMinutes: 30, description: 'Computed tomography scan' },
    { name: 'Thyroid Test (T3/T4/TSH)', avgDurationMinutes: 15, description: 'Thyroid function panel' },
    { name: 'Diabetes / HbA1c Test', avgDurationMinutes: 10, description: 'Fasting glucose & HbA1c' },
    { name: 'COVID / Rapid Antigen Test', avgDurationMinutes: 15, description: 'Rapid antigen or RT-PCR' },
    { name: 'Full Body Health Checkup', avgDurationMinutes: 60, description: 'Comprehensive wellness package' },
    { name: 'Pap Smear / Cytology', avgDurationMinutes: 20, description: 'Cervical cancer screening' },
  ],

  HOSPITAL: [
    { name: 'OPD — General Consultation', avgDurationMinutes: 20, description: 'General physician consultation' },
    { name: 'Specialist Consultation', avgDurationMinutes: 30, description: 'Cardio, ortho, neuro, etc.' },
    { name: 'Emergency Triage', avgDurationMinutes: 10, description: 'Immediate assessment & first aid' },
    { name: 'Pharmacy / Medicine Collection', avgDurationMinutes: 10, description: 'Prescription drug dispensing' },
    { name: 'Vaccination / Injection', avgDurationMinutes: 15, description: 'Immunisation & injections' },
    { name: 'Dressing / Wound Care', avgDurationMinutes: 20, description: 'Wound cleaning & bandaging' },
    { name: 'Physiotherapy Session', avgDurationMinutes: 45, description: 'Rehab & mobility therapy' },
    { name: 'Dental Consultation', avgDurationMinutes: 30, description: 'Dental check & treatment' },
    { name: 'Eye Examination', avgDurationMinutes: 25, description: 'Vision test & prescription' },
    { name: 'Discharge Processing', avgDurationMinutes: 30, description: 'Final paperwork & billing' },
    { name: 'Lab Report Collection', avgDurationMinutes: 5, description: 'Pick up test results' },
    { name: 'Insurance / TPA Desk', avgDurationMinutes: 25, description: 'Cashless claim & documentation' },
  ],

  BANK: [
    { name: 'Cash Deposit', avgDurationMinutes: 10, description: 'Deposit cash to account' },
    { name: 'Cash Withdrawal', avgDurationMinutes: 10, description: 'Withdraw over the counter' },
    { name: 'Cheque Submission', avgDurationMinutes: 10, description: 'Cheque deposit & clearing' },
    { name: 'Passbook Update', avgDurationMinutes: 5, description: 'Print latest transactions' },
    { name: 'Account Opening', avgDurationMinutes: 30, description: 'New savings or current account' },
    { name: 'Loan Inquiry / Application', avgDurationMinutes: 45, description: 'Home, personal, vehicle loans' },
    { name: 'Fixed Deposit / Recurring Deposit', avgDurationMinutes: 20, description: 'Open or close FD/RD' },
    { name: 'Debit / Credit Card Issue', avgDurationMinutes: 20, description: 'New card or replacement' },
    { name: 'Net Banking Setup', avgDurationMinutes: 15, description: 'Internet & mobile banking' },
    { name: 'KYC / Aadhaar Update', avgDurationMinutes: 15, description: 'Know Your Customer update' },
    { name: 'Locker Access', avgDurationMinutes: 15, description: 'Safe deposit locker service' },
    { name: 'Forex / Demand Draft', avgDurationMinutes: 20, description: 'Foreign exchange & DD issuance' },
    { name: 'General Customer Support', avgDurationMinutes: 20, description: 'Grievance & query resolution' },
  ],

  RESTAURANT: [
    { name: 'Dine-In Table', avgDurationMinutes: 45, description: 'Seated dining experience' },
    { name: 'Takeaway / Parcel Order', avgDurationMinutes: 15, description: 'Pack & carry your order' },
    { name: 'Pre-Booked Table', avgDurationMinutes: 30, description: 'Advance reservation check-in' },
    { name: 'Quick Bites / Snacks Counter', avgDurationMinutes: 10, description: 'Fast service counter' },
    { name: 'Buffet Entry', avgDurationMinutes: 60, description: 'All-you-can-eat spread' },
    { name: 'Private / Party Dining', avgDurationMinutes: 90, description: 'Reserved section for events' },
    { name: 'Delivery Order Pickup', avgDurationMinutes: 10, description: 'Self-pickup for online orders' },
  ],

  SALON: [
    { name: 'Haircut — Men', avgDurationMinutes: 20, description: 'Cut, style & finish' },
    { name: 'Haircut — Women', avgDurationMinutes: 45, description: 'Wash, cut & blow-dry' },
    { name: 'Beard Trim / Shave', avgDurationMinutes: 15, description: 'Grooming & clean shave' },
    { name: 'Hair Colour', avgDurationMinutes: 90, description: 'Global, highlights or balayage' },
    { name: 'Hair Spa / Keratin Treatment', avgDurationMinutes: 60, description: 'Deep conditioning therapy' },
    { name: 'Blow Dry & Styling', avgDurationMinutes: 30, description: 'Professional finish & styling' },
    { name: 'Facial', avgDurationMinutes: 45, description: 'Deep cleansing & moisturising' },
    { name: 'Clean-Up', avgDurationMinutes: 30, description: 'Basic skin clean-up' },
    { name: 'Manicure', avgDurationMinutes: 30, description: 'Nail shaping, polish & care' },
    { name: 'Pedicure', avgDurationMinutes: 40, description: 'Foot soak, scrub & polish' },
    { name: 'Threading', avgDurationMinutes: 10, description: 'Eyebrows, upper lip, forehead' },
    { name: 'Waxing — Arms / Legs', avgDurationMinutes: 30, description: 'Full arms or full legs wax' },
    { name: 'Full Body Waxing', avgDurationMinutes: 60, description: 'Complete body waxing session' },
    { name: 'Bridal / Party Makeup', avgDurationMinutes: 120, description: 'Full bridal or event makeup' },
  ],

  VEHICLE_SERVICE: [
    { name: 'Oil & Filter Change', avgDurationMinutes: 30, description: 'Engine oil + filter replacement' },
    { name: 'Tyre Change / Rotation', avgDurationMinutes: 20, description: 'Tyre swap or rotation' },
    { name: 'Battery Check / Replacement', avgDurationMinutes: 20, description: 'Test & replace car battery' },
    { name: 'General Service (4W)', avgDurationMinutes: 120, description: 'Full periodic car service' },
    { name: 'Two-Wheeler Service', avgDurationMinutes: 60, description: 'Bike/scooter periodic service' },
    { name: 'Car Wash & Interior Cleaning', avgDurationMinutes: 30, description: 'Exterior wash & vacuum' },
    { name: 'AC Gas Refill / Service', avgDurationMinutes: 60, description: 'AC cooling & gas top-up' },
    { name: 'Denting & Painting', avgDurationMinutes: 180, description: 'Body repair & repaint' },
    { name: 'Brake Inspection & Repair', avgDurationMinutes: 30, description: 'Brake pad & fluid check' },
    { name: 'Wheel Alignment & Balancing', avgDurationMinutes: 30, description: 'Precision alignment service' },
    { name: 'PUC / Emission Certificate', avgDurationMinutes: 15, description: 'Pollution under control test' },
    { name: 'Insurance Claim Assistance', avgDurationMinutes: 45, description: 'Accident claim documentation' },
    { name: 'Windshield / Glass Repair', avgDurationMinutes: 60, description: 'Chip repair or replacement' },
  ],
};

export const SECTOR_META: Record<string, { label: string; icon: string; description: string }> = {
  DIAGNOSTIC:      { label: 'Diagnostic Center',       icon: '🔬', description: 'Pathology labs & imaging centers' },
  HOSPITAL:        { label: 'Hospital / Clinic',        icon: '🏥', description: 'OPD, emergency & specialty care' },
  BANK:            { label: 'Bank',                     icon: '🏦', description: 'Retail banking & financial services' },
  RESTAURANT:      { label: 'Restaurant',               icon: '🍽️', description: 'Dine-in, takeaway & buffet' },
  SALON:           { label: 'Salon / Parlour',          icon: '💇', description: 'Hair, skin & beauty services' },
  VEHICLE_SERVICE: { label: 'Vehicle Service Center',   icon: '🔧', description: 'Car & two-wheeler service & repair' },
};
