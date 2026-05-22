import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ── Categories per sector ───────────────────────────────────────────────────

const CATEGORIES: Record<string, { name: string; avg: number }[]> = {
  DIAGNOSTIC: [
    { name: 'Blood Test (CBC / Complete Blood Count)', avg: 15 },
    { name: 'Lipid Profile', avg: 15 },
    { name: 'Liver Function Test (LFT)', avg: 15 },
    { name: 'Kidney Function Test (KFT)', avg: 15 },
    { name: 'Thyroid Profile (T3/T4/TSH)', avg: 15 },
    { name: 'Diabetes / HbA1c / Fasting Sugar', avg: 10 },
    { name: 'Urine Routine & Microscopy', avg: 10 },
    { name: 'Stool Examination', avg: 10 },
    { name: 'X-Ray (Chest / Spine / Limb)', avg: 20 },
    { name: 'ECG / Electrocardiogram', avg: 15 },
    { name: 'Ultrasound / Sonography (Abdomen)', avg: 30 },
    { name: 'Ultrasound (Pelvis / Obstetric)', avg: 30 },
    { name: 'Echocardiography (ECHO)', avg: 40 },
    { name: 'CT Scan', avg: 30 },
    { name: 'MRI Scan', avg: 45 },
    { name: 'Mammography', avg: 25 },
    { name: 'Bone Density (DEXA Scan)', avg: 20 },
    { name: 'COVID-19 RT-PCR / Rapid Antigen', avg: 15 },
    { name: 'Pap Smear / Cervical Cytology', avg: 20 },
    { name: 'Full Body Health Checkup Package', avg: 60 },
    { name: 'Vitamin D / B12 Test', avg: 15 },
    { name: 'Culture & Sensitivity Test', avg: 15 },
    { name: 'Report Collection', avg: 5 },
  ],

  HOSPITAL: [
    { name: 'OPD — General Physician', avg: 20 },
    { name: 'OPD — Cardiologist', avg: 30 },
    { name: 'OPD — Orthopaedic', avg: 25 },
    { name: 'OPD — Neurologist', avg: 30 },
    { name: 'OPD — Gynaecologist', avg: 25 },
    { name: 'OPD — Paediatrician', avg: 20 },
    { name: 'OPD — Dermatologist', avg: 20 },
    { name: 'OPD — ENT Specialist', avg: 20 },
    { name: 'OPD — Ophthalmologist', avg: 25 },
    { name: 'OPD — Diabetologist / Endocrinologist', avg: 30 },
    { name: 'OPD — Psychiatrist / Counsellor', avg: 45 },
    { name: 'OPD — Oncologist', avg: 40 },
    { name: 'Dental Consultation & Treatment', avg: 30 },
    { name: 'Emergency Triage', avg: 10 },
    { name: 'Pharmacy / Medicine Collection', avg: 10 },
    { name: 'Vaccination / Injection Room', avg: 15 },
    { name: 'Dressing & Wound Care', avg: 20 },
    { name: 'Physiotherapy Session', avg: 45 },
    { name: 'Lab Sample Collection', avg: 10 },
    { name: 'Report / Discharge Collection', avg: 10 },
    { name: 'Insurance / TPA Desk', avg: 25 },
    { name: 'Radiology / Imaging Registration', avg: 15 },
  ],

  BANK: [
    { name: 'Cash Deposit', avg: 10 },
    { name: 'Cash Withdrawal (Over the Counter)', avg: 10 },
    { name: 'Cheque Submission / Clearance', avg: 10 },
    { name: 'Demand Draft / Pay Order', avg: 20 },
    { name: 'RTGS / NEFT / Fund Transfer', avg: 15 },
    { name: 'Passbook Update', avg: 5 },
    { name: 'Account Opening (Savings / Current)', avg: 30 },
    { name: 'Fixed Deposit Opening / Closure', avg: 20 },
    { name: 'Recurring Deposit', avg: 15 },
    { name: 'Loan Inquiry (Home / Personal / Vehicle)', avg: 45 },
    { name: 'Loan Application & Documentation', avg: 60 },
    { name: 'Debit Card / Credit Card Issue or Replacement', avg: 20 },
    { name: 'Net Banking & Mobile Banking Setup', avg: 15 },
    { name: 'KYC / Aadhaar / PAN Update', avg: 15 },
    { name: 'Locker Access', avg: 15 },
    { name: 'Forex Exchange / Remittance', avg: 20 },
    { name: 'Deceased Account / Nomination Update', avg: 30 },
    { name: 'Grievance & General Customer Support', avg: 20 },
    { name: 'Senior Citizen Services', avg: 20 },
    { name: 'Gold Loan', avg: 30 },
  ],

  RESTAURANT: [
    { name: 'Dine-In — Regular Table', avg: 45 },
    { name: 'Dine-In — Family Section', avg: 50 },
    { name: 'Dine-In — Couple / Romantic Seating', avg: 60 },
    { name: 'Pre-Booked Table Check-In', avg: 30 },
    { name: 'Buffet Entry (Lunch)', avg: 60 },
    { name: 'Buffet Entry (Dinner)', avg: 75 },
    { name: 'Takeaway / Parcel Order', avg: 15 },
    { name: 'Home Delivery Order Pickup', avg: 10 },
    { name: 'Quick Bites / Snacks Counter', avg: 10 },
    { name: 'Breakfast Counter', avg: 20 },
    { name: 'Bakery / Dessert Counter', avg: 10 },
    { name: 'Bar / Beverage Counter', avg: 15 },
    { name: 'Private Dining Room', avg: 90 },
    { name: 'Rooftop / Outdoor Seating', avg: 60 },
    { name: 'Birthday / Anniversary Table Setup', avg: 30 },
    { name: 'Corporate Group Booking', avg: 90 },
    { name: 'Jain / Dietary Special Counter', avg: 20 },
    { name: 'Live Counter (Dosa / Chaat / Grill)', avg: 15 },
  ],

  SALON: [
    { name: 'Haircut — Men (Regular)', avg: 20 },
    { name: 'Haircut — Men (Designer / Fade)', avg: 30 },
    { name: 'Beard Trim & Shaping', avg: 15 },
    { name: 'Clean Shave', avg: 15 },
    { name: 'Head Massage', avg: 20 },
    { name: 'Haircut — Women (Short)', avg: 40 },
    { name: 'Haircut — Women (Long / U-Cut / V-Cut)', avg: 60 },
    { name: 'Hair Wash & Blow Dry', avg: 30 },
    { name: 'Hair Colour — Global (Full Head)', avg: 90 },
    { name: 'Hair Colour — Highlights / Balayage', avg: 120 },
    { name: 'Hair Spa / Keratin Treatment', avg: 60 },
    { name: 'Straightening / Smoothening', avg: 90 },
    { name: 'Facial — Basic', avg: 40 },
    { name: 'Facial — Gold / Diamond / Fruit', avg: 60 },
    { name: 'Clean-Up (Express Facial)', avg: 30 },
    { name: 'Bleach — Face / Arms', avg: 20 },
    { name: 'D-Tan Pack', avg: 25 },
    { name: 'Threading — Eyebrows / Upper Lip / Full Face', avg: 10 },
    { name: 'Waxing — Full Arms or Full Legs', avg: 30 },
    { name: 'Waxing — Full Body', avg: 60 },
    { name: 'Manicure — Basic / Gel', avg: 30 },
    { name: 'Pedicure — Basic / Spa', avg: 40 },
    { name: 'Nail Art & Extensions', avg: 60 },
    { name: 'Bridal / Party Makeup Package', avg: 120 },
    { name: 'Pre-Bridal Package (Full Session)', avg: 180 },
  ],

  VEHICLE_SERVICE: [
    { name: 'Engine Oil & Filter Change', avg: 30 },
    { name: 'Air Filter Replacement', avg: 15 },
    { name: 'Tyre Change / Rotation / Balancing', avg: 30 },
    { name: 'Wheel Alignment', avg: 30 },
    { name: 'Battery Check & Replacement', avg: 20 },
    { name: 'General Periodic Service (Car)', avg: 120 },
    { name: 'General Periodic Service (Two-Wheeler)', avg: 60 },
    { name: 'Car Wash — Exterior', avg: 20 },
    { name: 'Car Wash — Full Interior + Exterior Detailing', avg: 60 },
    { name: 'AC Gas Refill & Performance Check', avg: 60 },
    { name: 'AC Compressor / Condenser Service', avg: 90 },
    { name: 'Brake Pad Replacement & Inspection', avg: 40 },
    { name: 'Clutch & Gearbox Service', avg: 90 },
    { name: 'Engine Diagnostics (OBD Scan)', avg: 30 },
    { name: 'Suspension & Steering Check', avg: 30 },
    { name: 'Denting & Painting (Minor)', avg: 180 },
    { name: 'Windshield Chip Repair / Replacement', avg: 60 },
    { name: 'Electrical & Wiring Repair', avg: 60 },
    { name: 'PUC / Emission Certificate', avg: 15 },
    { name: 'Insurance Claim & Accident Repair', avg: 45 },
    { name: 'Headlight / Taillight Replacement', avg: 20 },
    { name: 'Radiator Flush & Coolant Top-Up', avg: 30 },
  ],
};

// ── Business data per sector ────────────────────────────────────────────────

const BUSINESSES: Record<string, { name: string; address: string; city: string }[]> = {
  DIAGNOSTIC: [
    { name: 'Apollo Diagnostics',               address: 'Salt Lake Sector V',         city: 'Kolkata' },
    { name: 'Dr. Lal PathLabs',                 address: '12 Park Street',              city: 'Kolkata' },
    { name: 'Thyrocare Diagnostics',            address: 'Andheri East',                city: 'Mumbai' },
    { name: 'SRL Diagnostics',                  address: 'Connaught Place Block B',     city: 'New Delhi' },
    { name: 'Metropolis Healthcare',            address: 'Baner Road',                  city: 'Pune' },
    { name: 'Neuberg Diagnostics',              address: '8 Nungambakkam High Road',    city: 'Chennai' },
    { name: 'Vijaya Diagnostics',               address: 'Ameerpet Main Road',          city: 'Hyderabad' },
    { name: 'Agilus Diagnostics',               address: '100 Feet Road, Indiranagar',  city: 'Bangalore' },
    { name: 'Mahajan Imaging & Diagnostics',    address: 'Rajouri Garden',              city: 'New Delhi' },
    { name: 'Suburban Diagnostics',             address: 'Vile Parle West',             city: 'Mumbai' },
    { name: 'PathKind Labs',                    address: 'Hazratganj',                  city: 'Lucknow' },
    { name: 'Redcliffe Labs',                   address: 'New Town Action Area 2',      city: 'Kolkata' },
    { name: 'City X-Ray & Diagnostics',         address: '43 Dharmatala Street',        city: 'Kolkata' },
    { name: 'Sanjivani Pathology & Imaging',    address: 'Deccan Gymkhana',             city: 'Pune' },
    { name: 'Global Diagnostics',               address: 'Sector 62',                   city: 'Noida' },
    { name: 'Prime Diagnostics',                address: 'Road No 36, Jubilee Hills',   city: 'Hyderabad' },
    { name: 'Aarthi Scans & Labs',              address: 'Anna Nagar 2nd Avenue',       city: 'Chennai' },
    { name: 'Quest Diagnostics',                address: 'Linking Road, Bandra West',   city: 'Mumbai' },
    { name: 'Healthians Diagnostics',           address: 'Sector 47',                   city: 'Gurugram' },
    { name: 'iMedic Diagnostic Centre',         address: 'HSR Layout 5th Sector',       city: 'Bangalore' },
  ],

  HOSPITAL: [
    { name: 'Apollo Hospital OPD',              address: '21 Greams Lane',              city: 'Chennai' },
    { name: 'Fortis Hospital OPD',              address: '14 Cunningham Road',          city: 'Bangalore' },
    { name: 'Medanta OPD',                      address: 'Sector 38',                   city: 'Gurugram' },
    { name: 'Manipal Hospital OPD',             address: 'HAL Airport Road',            city: 'Bangalore' },
    { name: 'Kokilaben Ambani Hospital OPD',    address: 'Rao Saheb Achutrao Patwardhan Marg', city: 'Mumbai' },
    { name: 'Narayana Health OPD',              address: 'Bommasandra Industrial Area', city: 'Bangalore' },
    { name: 'Max Healthcare OPD',               address: 'Press Enclave Road, Saket',   city: 'New Delhi' },
    { name: 'Ruby Hall Clinic OPD',             address: '40 Sassoon Road',             city: 'Pune' },
    { name: 'CMRI Hospital OPD',                address: '7/2 Diamond Harbour Road',    city: 'Kolkata' },
    { name: 'Lilavati Hospital OPD',            address: 'A-791 Bandra Reclamation',    city: 'Mumbai' },
    { name: 'Yashoda Hospital OPD',             address: 'Raj Bhavan Road, Somajiguda', city: 'Hyderabad' },
    { name: 'AMRI Hospital OPD',                address: 'JC 16-17, Sector III Salt Lake', city: 'Kolkata' },
    { name: 'Gleneagles Hospital OPD',          address: 'Perumbakkam',                 city: 'Chennai' },
    { name: 'Sir Ganga Ram Hospital OPD',       address: 'Rajinder Nagar',              city: 'New Delhi' },
    { name: 'Hinduja Hospital OPD',             address: 'Veer Savarkar Marg, Mahim',   city: 'Mumbai' },
    { name: 'Columbia Asia Hospital OPD',       address: 'Whitefield Main Road',        city: 'Bangalore' },
    { name: 'KIMS Hospital OPD',                address: 'Minister Road, Secunderabad', city: 'Hyderabad' },
    { name: 'Sahyadri Hospital OPD',            address: '30 Karve Road',               city: 'Pune' },
    { name: 'Peerless Hospital OPD',            address: '360 Pancha Sayar',            city: 'Kolkata' },
    { name: 'Wockhardt Hospital OPD',           address: '1877 Dr. Anandrao Nair Road', city: 'Mumbai' },
  ],

  BANK: [
    { name: 'State Bank of India — Park Street', address: '1 Park Street',             city: 'Kolkata' },
    { name: 'HDFC Bank — Connaught Place',        address: 'Block F, Connaught Place',  city: 'New Delhi' },
    { name: 'ICICI Bank — Bandra Kurla Complex',  address: 'BKC Road',                  city: 'Mumbai' },
    { name: 'Axis Bank — MG Road',                address: '100 MG Road',               city: 'Bangalore' },
    { name: 'Punjab National Bank — Hazratganj',  address: 'Hazratganj Market',         city: 'Lucknow' },
    { name: 'Bank of Baroda — Alkapuri',          address: 'Productivity Road',         city: 'Vadodara' },
    { name: 'Canara Bank — Anna Salai',           address: '767 Anna Salai',            city: 'Chennai' },
    { name: 'Kotak Mahindra Bank — Vashi',        address: 'Sector 17 Vashi',           city: 'Navi Mumbai' },
    { name: 'Yes Bank — Baner',                   address: 'Baner Road',                city: 'Pune' },
    { name: 'IndusInd Bank — Jubilee Hills',      address: 'Road No 36 Jubilee Hills',  city: 'Hyderabad' },
    { name: 'Union Bank of India — Dalhousie',    address: '11 Hemanta Basu Sarani',    city: 'Kolkata' },
    { name: 'Bank of India — Fort',               address: 'Express Towers, Nariman Point', city: 'Mumbai' },
    { name: 'Federal Bank — MG Road',             address: 'Federal Towers, MG Road',   city: 'Kochi' },
    { name: 'RBL Bank — Worli',                   address: 'One Indiabulls Centre',     city: 'Mumbai' },
    { name: 'IDFC First Bank — Whitefield',       address: 'Prestige Tech Park',        city: 'Bangalore' },
    { name: 'UCO Bank — Esplanade',               address: '10 BTM Sarani',             city: 'Kolkata' },
    { name: 'Central Bank of India — Chandni Chowk', address: 'Chandni Chowk Market',  city: 'New Delhi' },
    { name: 'Indian Overseas Bank — Mylapore',    address: '38 Kutchery Road',          city: 'Chennai' },
    { name: 'Karnataka Bank — Mangalore',         address: 'Kodialbail',                city: 'Mangalore' },
    { name: 'South Indian Bank — Thrissur',       address: 'SIB House, Mission Quarters', city: 'Thrissur' },
  ],

  RESTAURANT: [
    { name: 'Pind Balluchi',                    address: 'Palika Bhavan, Connaught Place', city: 'New Delhi' },
    { name: 'Mainland China',                   address: '6 Elgin Road',                city: 'Kolkata' },
    { name: 'Barbeque Nation',                  address: '100 Feet Road, Indiranagar',  city: 'Bangalore' },
    { name: 'Saravana Bhavan',                  address: '293 Anna Salai, T. Nagar',    city: 'Chennai' },
    { name: 'Paradise Restaurant',              address: 'SD Road, Secunderabad',        city: 'Hyderabad' },
    { name: 'Oh! Calcutta',                     address: 'Forum Mall, Elgin Road',      city: 'Kolkata' },
    { name: 'Bukhara — ITC Maurya',             address: 'Sardar Patel Marg, Chanakyapuri', city: 'New Delhi' },
    { name: 'Trishna',                          address: '7 Ropewalk Lane, Kala Ghoda', city: 'Mumbai' },
    { name: 'MTR Restaurant',                   address: '11 Lalbagh Road',             city: 'Bangalore' },
    { name: 'Peter Cat',                        address: '18A Park Street',             city: 'Kolkata' },
    { name: 'Punjab Grill',                     address: 'Ambience Mall, Vasant Kunj',  city: 'New Delhi' },
    { name: 'The Yellow Chilli',                address: 'DLF Cyber City, Sector 24',   city: 'Gurugram' },
    { name: 'Absolute Barbecues',               address: 'Road No 45, Jubilee Hills',   city: 'Hyderabad' },
    { name: 'Cafe Mondegar',                    address: 'Metro House, Colaba Causeway', city: 'Mumbai' },
    { name: 'Peshawri — ITC Grand Bharat',      address: 'NH 48, Manesar',              city: 'Gurugram' },
    { name: 'Social — Koramangala',             address: '118 Koramangala 5th Block',   city: 'Bangalore' },
    { name: 'Dakshin — ITC Grand Chola',        address: '63 Anna Salai',               city: 'Chennai' },
    { name: 'Swagath Restaurant',               address: '26 Residency Road',           city: 'Bangalore' },
    { name: 'Copper Chimney',                   address: 'Dr. Annie Besant Road, Worli', city: 'Mumbai' },
    { name: 'Oudh 1590',                        address: '5A Rawdon Street',            city: 'Kolkata' },
  ],

  SALON: [
    { name: 'Jawed Habib Hair Studio',          address: 'South Extension Part 2',      city: 'New Delhi' },
    { name: 'Naturals Salon',                   address: 'Anna Nagar 2nd Avenue',       city: 'Chennai' },
    { name: 'Lakmé Salon',                      address: 'Linking Road, Bandra',        city: 'Mumbai' },
    { name: 'Green Trends Salon',               address: 'Nungambakkam High Road',      city: 'Chennai' },
    { name: 'Toni & Guy',                       address: 'UB City Mall',                city: 'Bangalore' },
    { name: 'YLG Salon',                        address: '80 Feet Road, Koramangala',   city: 'Bangalore' },
    { name: 'Enrich Salon',                     address: 'Gulmohar Road, Juhu',         city: 'Mumbai' },
    { name: 'Affinity Salon',                   address: 'N-Block, Connaught Place',    city: 'New Delhi' },
    { name: 'Jean-Claude Biguine Salon',        address: 'Road No 36, Jubilee Hills',   city: 'Hyderabad' },
    { name: 'Looks Salon',                      address: 'South Extension Part 1',      city: 'New Delhi' },
    { name: 'Geetanjali Salon',                 address: 'DLF Promenade, Vasant Kunj',  city: 'New Delhi' },
    { name: 'B-Blunt Salon',                    address: 'Hill Road, Bandra West',      city: 'Mumbai' },
    { name: 'Curl Up Salon',                    address: 'City Centre 2, New Town',     city: 'Kolkata' },
    { name: 'Urban Looks Studio',               address: 'HSR Layout 27th Main',        city: 'Bangalore' },
    { name: 'The Bombay Salon',                 address: 'High Street Phoenix, Worli',  city: 'Mumbai' },
    { name: 'Aura Beauty Lounge',               address: 'Road No 45, Jubilee Hills',   city: 'Hyderabad' },
    { name: 'Scissors & Combs',                 address: 'Koregaon Park Lane 6',        city: 'Pune' },
    { name: 'HQ Hair Studio',                   address: 'Salt Lake Sector I',          city: 'Kolkata' },
    { name: 'Style N Scissors',                 address: 'Sector 18 Atta Market',       city: 'Noida' },
    { name: 'Prose Salon & Spa',                address: 'Indiranagar 12th Main',       city: 'Bangalore' },
  ],

  VEHICLE_SERVICE: [
    { name: 'Maruti Suzuki ARENA Service Centre', address: 'Dwarka Sector 12',          city: 'New Delhi' },
    { name: 'Hyundai Authorised Service',         address: 'Andheri East Link Road',     city: 'Mumbai' },
    { name: 'Tata Motors Service Centre',         address: 'Guindy Industrial Estate',   city: 'Chennai' },
    { name: 'Honda Cars Authorised Service',      address: 'Whitefield Main Road',       city: 'Bangalore' },
    { name: 'Mahindra First Choice Service',      address: 'Baner Pashan Link Road',     city: 'Pune' },
    { name: 'Toyota Dealership Service',          address: 'Road No 2, Banjara Hills',   city: 'Hyderabad' },
    { name: 'Bajaj Auto Authorised Service',      address: 'EM Bypass, Kasba',           city: 'Kolkata' },
    { name: 'Hero MotoCorp Service Centre',       address: 'Lajpat Nagar Part 4',        city: 'New Delhi' },
    { name: 'TVS Authorised Service Centre',      address: 'Sarjapur Road, Koramangala', city: 'Bangalore' },
    { name: 'Volkswagen Dealership Service',      address: '100 MG Road',                city: 'Bangalore' },
    { name: 'Renault Authorised Service',         address: 'Anna Nagar East',             city: 'Chennai' },
    { name: 'Kia Motors Service Centre',          address: 'Golf Course Road',            city: 'Gurugram' },
    { name: 'Skoda Authorised Workshop',          address: 'Western Express Highway, Bandra', city: 'Mumbai' },
    { name: 'Bosch Car Service Centre',           address: 'Sector 18',                  city: 'Noida' },
    { name: 'GoMechanic Service Centre',          address: 'Kandivali West',              city: 'Mumbai' },
    { name: 'PitStop Auto Service',               address: 'HSR Layout Sector 1',        city: 'Bangalore' },
    { name: 'Euro Car Care Service',              address: 'Ameerpet',                    city: 'Hyderabad' },
    { name: 'Carz Station Auto Service',          address: 'New Town Action Area 1',     city: 'Kolkata' },
    { name: 'Fast Track Auto Care',               address: 'Janpath, Connaught Place',   city: 'New Delhi' },
    { name: 'Ford Authorised Service Centre',     address: 'Vashi Sector 30',            city: 'Navi Mumbai' },
  ],
};

// ── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...\n');

  const password = await bcrypt.hash('seed1234', 10);

  // One owner per sector
  const ownerEmails: Record<string, string> = {
    DIAGNOSTIC:      'owner.diagnostic@quzen.in',
    HOSPITAL:        'owner.hospital@quzen.in',
    BANK:            'owner.bank@quzen.in',
    RESTAURANT:      'owner.restaurant@quzen.in',
    SALON:           'owner.salon@quzen.in',
    VEHICLE_SERVICE: 'owner.vehicle@quzen.in',
  };

  const ownerNames: Record<string, string> = {
    DIAGNOSTIC:      'Dr. Rajan Mehta',
    HOSPITAL:        'Dr. Priya Nair',
    BANK:            'Ramesh Gupta',
    RESTAURANT:      'Vikram Sharma',
    SALON:           'Neha Kapoor',
    VEHICLE_SERVICE: 'Suresh Patel',
  };

  // Create owners
  const owners: Record<string, string> = {};
  for (const sector of Object.keys(ownerEmails)) {
    const email = ownerEmails[sector];
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      owners[sector] = existing.id;
      console.log(`  ↪ Owner exists: ${email}`);
    } else {
      const user = await prisma.user.create({
        data: { name: ownerNames[sector], email, passwordHash: password, role: 'BUSINESS_OWNER' },
      });
      owners[sector] = user.id;
      console.log(`  ✓ Created owner: ${email}`);
    }
  }

  // Create test user
  const testEmail = 'testuser@quzen.in';
  const existingTest = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!existingTest) {
    await prisma.user.create({
      data: { name: 'Arijit Paul (Test User)', email: testEmail, passwordHash: password, role: 'USER' },
    });
    console.log(`  ✓ Created test user: ${testEmail}`);
  }

  console.log('\n🏢 Seeding businesses...\n');

  for (const sector of Object.keys(BUSINESSES)) {
    const bizList = BUSINESSES[sector];
    const cats    = CATEGORIES[sector];
    const ownerId = owners[sector];

    console.log(`  📂 ${sector} (${bizList.length} businesses, ${cats.length} categories each)`);

    for (const biz of bizList) {
      // Skip if already exists
      const existing = await prisma.business.findFirst({
        where: { name: biz.name, city: biz.city },
      });
      if (existing) {
        console.log(`    ↪ Skipping: ${biz.name}`);
        continue;
      }

      const business = await prisma.business.create({
        data: {
          ownerId,
          name: biz.name,
          sector: sector as any,
          address: biz.address,
          city: biz.city,
          isActive: true,
        },
      });

      // Create all categories for this business
      await prisma.serviceCategory.createMany({
        data: cats.map((c) => ({
          businessId: business.id,
          name: c.name,
          avgDurationMinutes: c.avg,
          isActive: true,
        })),
      });

      console.log(`    ✓ ${biz.name} — ${biz.city} (${cats.length} services)`);
    }
  }

  console.log('\n✅ Seed complete!\n');
  console.log('📋 Login credentials:');
  console.log('  Diagnostic Owner : owner.diagnostic@quzen.in  / seed1234');
  console.log('  Hospital Owner   : owner.hospital@quzen.in    / seed1234');
  console.log('  Bank Owner       : owner.bank@quzen.in        / seed1234');
  console.log('  Restaurant Owner : owner.restaurant@quzen.in  / seed1234');
  console.log('  Salon Owner      : owner.salon@quzen.in       / seed1234');
  console.log('  Vehicle Owner    : owner.vehicle@quzen.in     / seed1234');
  console.log('  Test User        : testuser@quzen.in          / seed1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
