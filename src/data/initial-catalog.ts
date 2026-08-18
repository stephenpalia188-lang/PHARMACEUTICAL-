import { Category, Product, Service } from '../types';

export const INITIAL_CATEGORIES: Array<Omit<Category, 'created_at' | 'updated_at'>> = [
  {
    id: 'cat-otc-pain',
    name: 'Over-The-Counter & Pain Relief',
    description: 'Everyday pain relievers, fever management, cold & flu remedies, and anti-inflammatory medications.'
  },
  {
    id: 'cat-antimalarials-antibiotics',
    name: 'Antimalarials & Essential Antibiotics',
    description: 'MoH approved malaria treatments, broad-spectrum antibiotics, and infectious disease therapies.'
  },
  {
    id: 'cat-cardiovascular-diabetes',
    name: 'Cardiovascular & Diabetes Care',
    description: 'Hypertension maintenance, blood sugar management, glucose monitors, and cardiovascular wellness.'
  },
  {
    id: 'cat-maternal-child',
    name: 'Maternal, Child & Baby Health',
    description: 'Prenatal supplements, infant nutrition, baby skincare, colic remedies, and pediatric syrups.'
  },
  {
    id: 'cat-vitamins-wellness',
    name: 'Vitamins, Supplements & Immunity',
    description: 'Daily multivitamins, Vitamin C, Zinc, Cod Liver Oil, Calcium, and vitality supplements.'
  },
  {
    id: 'cat-firstaid-surgical',
    name: 'First Aid, Wound Care & Diagnostics',
    description: 'Digital thermometers, BP monitors, antiseptics, bandages, gauze, and surgical essentials.'
  },
  {
    id: 'cat-gastro-digestive',
    name: 'Gastrointestinal & Digestive Health',
    description: 'Antacids, Omeprazole, Oral Rehydration Salts (ORS), deworming, and digestive health remedies.'
  }
];

export const INITIAL_PRODUCTS: Array<Omit<Product, 'created_at' | 'updated_at'>> = [
  {
    id: 'prod-panadol-extra',
    category_id: 'cat-otc-pain',
    name: 'Panadol Extra 500mg (Pack of 20)',
    description: 'Fast and effective relief from severe headache, toothache, muscle aches, backache, and period pain with Caffeine and Paracetamol formulation.',
    price_kes: 250,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 150,
    is_available: true,
    is_featured: true,
    dosage: '1-2 tablets every 4 to 6 hours as needed (Max 8 tablets in 24h)',
    requires_prescription: false
  },
  {
    id: 'prod-coartem-forte',
    category_id: 'cat-antimalarials-antibiotics',
    name: 'Coartem Forte 80/480mg (6 Tablets)',
    description: 'First-line Artemether/Lumefantrine combination therapy for acute uncomplicated Plasmodium falciparum malaria in adults and children.',
    price_kes: 650,
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 80,
    is_available: true,
    is_featured: true,
    dosage: 'Take as directed with food or full-fat milk for optimal absorption over 3 days.',
    requires_prescription: true
  },
  {
    id: 'prod-amoxicillin-500',
    category_id: 'cat-antimalarials-antibiotics',
    name: 'Amoxicillin 500mg Capsules (20s)',
    description: 'Broad spectrum penicillin antibiotic indicated for respiratory tract, ear/nose/throat, urinary tract, and skin bacterial infections.',
    price_kes: 350,
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 95,
    is_available: true,
    is_featured: false,
    dosage: 'One capsule 3 times daily (every 8 hours) with or after meals.',
    requires_prescription: true
  },
  {
    id: 'prod-omeprazole-20',
    category_id: 'cat-gastro-digestive',
    name: 'Omeprazole 20mg Capsules (14s)',
    description: 'Proton pump inhibitor (PPI) for heartburn, acid reflux (GERD), gastric and duodenal ulcers relief.',
    price_kes: 400,
    image_url: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 120,
    is_available: true,
    is_featured: true,
    dosage: 'Take 1 capsule once daily in the morning before breakfast.',
    requires_prescription: false
  },
  {
    id: 'prod-omron-bp-monitor',
    category_id: 'cat-firstaid-surgical',
    name: 'Omron M2 Basic Automatic Blood Pressure Monitor',
    description: 'Clinically validated upper-arm digital blood pressure and pulse rate monitor with Intellisense technology for comfortable, accurate readings.',
    price_kes: 4800,
    image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 25,
    is_available: true,
    is_featured: true,
    dosage: 'For clinical and at-home blood pressure monitoring.',
    requires_prescription: false
  },
  {
    id: 'prod-onetouch-glucometer',
    category_id: 'cat-cardiovascular-diabetes',
    name: 'OneTouch Select Plus Blood Glucose Meter Kit',
    description: 'Accurate blood sugar monitor kit with ColorSure technology, lancing device, and 10 test strips for easy diabetes monitoring.',
    price_kes: 3200,
    image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 30,
    is_available: true,
    is_featured: true,
    dosage: 'Self-monitoring blood glucose device for diabetic patients.',
    requires_prescription: false
  },
  {
    id: 'prod-onetouch-strips',
    category_id: 'cat-cardiovascular-diabetes',
    name: 'OneTouch Select Plus Test Strips (50 Strips)',
    description: '50 blood glucose testing strips with fast 5-second test time requiring only a tiny 1.0uL blood sample.',
    price_kes: 2600,
    image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 45,
    is_available: true,
    is_featured: false,
    dosage: 'Use with OneTouch Select Plus Meter.',
    requires_prescription: false
  },
  {
    id: 'prod-metformin-500',
    category_id: 'cat-cardiovascular-diabetes',
    name: 'Metformin Hydrochloride 500mg (100 Tablets)',
    description: 'First-line medication for the treatment of type 2 diabetes mellitus, particularly in overweight individuals.',
    price_kes: 550,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 90,
    is_available: true,
    is_featured: false,
    dosage: 'As prescribed by physician. Take with or immediately after meals.',
    requires_prescription: true
  },
  {
    id: 'prod-amlodipine-5',
    category_id: 'cat-cardiovascular-diabetes',
    name: 'Amlodipine Besylate 5mg (30 Tablets)',
    description: 'Calcium channel blocker used to treat high blood pressure (hypertension) and angina (chest pain).',
    price_kes: 450,
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 110,
    is_available: true,
    is_featured: false,
    dosage: 'One tablet daily at the same time each day.',
    requires_prescription: true
  },
  {
    id: 'prod-cetirizine-10',
    category_id: 'cat-otc-pain',
    name: 'Cetirizine 10mg Anti-Allergy Tablets (30s)',
    description: 'Non-drowsy 24-hour relief from seasonal allergic rhinitis, hay fever, sneezing, runny nose, itchy watery eyes, and hives.',
    price_kes: 300,
    image_url: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 140,
    is_available: true,
    is_featured: false,
    dosage: '1 tablet once daily with water.',
    requires_prescription: false
  },
  {
    id: 'prod-ors-zinc-kit',
    category_id: 'cat-gastro-digestive',
    name: 'Oral Rehydration Salts (ORS) + Zinc Sulphate Pack (5 sachets)',
    description: 'WHO/UNICEF recommended rehydration solution and zinc supplementation for treatment of acute diarrhea and dehydration in children and adults.',
    price_kes: 180,
    image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 200,
    is_available: true,
    is_featured: true,
    dosage: 'Dissolve 1 sachet in 1 Litre of clean drinking water.',
    requires_prescription: false
  },
  {
    id: 'prod-seven-seas-cod-liver',
    category_id: 'cat-vitamins-wellness',
    name: 'Seven Seas Pure Cod Liver Oil Plus Omega-3 (300ml)',
    description: 'Rich natural source of Omega-3 EPA & DHA, Vitamin A, Vitamin D for healthy heart, bones, teeth, and natural immune system support.',
    price_kes: 1250,
    image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 40,
    is_available: true,
    is_featured: true,
    dosage: 'Adults: 10ml daily. Children (over 4 years): 5ml daily.',
    requires_prescription: false
  },
  {
    id: 'prod-dettol-antiseptic-500',
    category_id: 'cat-firstaid-surgical',
    name: 'Dettol Liquid Antiseptic Disinfectant (500ml)',
    description: 'Proven effective antiseptic for first aid wound cleansing, minor cuts, bites, stings, and personal hygiene.',
    price_kes: 680,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 65,
    is_available: true,
    is_featured: false,
    dosage: 'Dilute 1 capful in water for wound cleansing.',
    requires_prescription: false
  },
  {
    id: 'prod-prenatal-multivitamins',
    category_id: 'cat-maternal-child',
    name: 'Pregnacare Original Prenatal Multivitamins (30 Tablets)',
    description: 'Expert nutrition for mother and baby with 400mcg Folic Acid, Iron, Vitamin D, and essential micronutrients throughout pregnancy.',
    price_kes: 1650,
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 35,
    is_available: true,
    is_featured: true,
    dosage: '1 tablet per day with your main meal.',
    requires_prescription: false
  },
  {
    id: 'prod-digital-thermometer',
    category_id: 'cat-firstaid-surgical',
    name: 'Accu-Check Fast Read Digital Thermometer',
    description: 'High precision 10-second digital fever thermometer with fever alarm, memory recall, and waterproof tip.',
    price_kes: 450,
    image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
    stock_quantity: 60,
    is_available: true,
    is_featured: false,
    dosage: 'For oral, underarm (axillary), or rectal temperature measurements.',
    requires_prescription: false
  }
];

export const INITIAL_SERVICES: Array<Omit<Service, 'created_at' | 'updated_at'>> = [
  {
    id: 'srv-prescription-dispensing',
    name: 'Prescription Dispensing & Clinical Verification',
    description: 'Professional evaluation, drug-drug interaction screening, dosage verification, and dispensing of authentic registered medicines by qualified pharmacists.',
    image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    duration_minutes: 15,
    price_kes: 0
  },
  {
    id: 'srv-bp-monitoring',
    name: 'Blood Pressure & Vital Signs Screening',
    description: 'Quick, accurate blood pressure testing with clinical consultation on hypertension prevention, lifestyle adjustments, and medication adherence.',
    image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    duration_minutes: 10,
    price_kes: 100
  },
  {
    id: 'srv-blood-sugar-testing',
    name: 'Random & Fasting Blood Glucose (Sugar) Testing',
    description: 'Immediate capillary blood glucose check with counseling for diabetic and pre-diabetic patients, including dietary guidance.',
    image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    duration_minutes: 10,
    price_kes: 150
  },
  {
    id: 'srv-pharmacist-consultation',
    name: 'Pharmacist Medication Counseling & Review',
    description: 'One-on-one session to discuss proper drug usage, side effect mitigation, polypharmacy management, and wellness optimization.',
    image_url: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    duration_minutes: 20,
    price_kes: 0
  },
  {
    id: 'srv-wound-dressing',
    name: 'Minor Wound Dressing & First Aid Care',
    description: 'Aseptic cleansing, antiseptic treatment, and sterile dressing for minor cuts, burns, scrapes, and post-procedural wound maintenance.',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    duration_minutes: 20,
    price_kes: 300
  },
  {
    id: 'srv-chronic-refill',
    name: 'Chronic Disease Medication Refill Program',
    description: 'Scheduled monthly refills for hypertension, diabetes, asthma, and arthritis patients in Kitale and surrounding Trans Nzoia region.',
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
    is_active: true,
    duration_minutes: 15,
    price_kes: 0
  }
];
