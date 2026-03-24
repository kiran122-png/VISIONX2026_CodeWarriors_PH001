"""
Script to safely insert maternal risk endpoint into app.py
Run: python insert_maternal.py
"""

MATERNAL_CODE = '''
# -- Maternal / Pregnancy Risk Screener ----------------------------------------
@app.route('/api/maternal-risk', methods=['POST'])
def maternal_risk():
    data = request.json
    age           = int(data.get('age', 25))
    weeks         = int(data.get('weeks', 20))
    hemoglobin    = float(data.get('hemoglobin', 11.0))
    systolic      = int(data.get('systolic', 120))
    diastolic     = int(data.get('diastolic', 80))
    weight        = float(data.get('weight', 60))
    height        = float(data.get('height', 155))
    gravida       = int(data.get('gravida', 1))
    prev_cs       = data.get('prev_cs', False)
    diabetes_hist = data.get('diabetes_hist', False)
    symptoms      = data.get('symptoms', [])

    risk_score   = 0
    risk_factors = []
    recommendations = []

    # Anemia
    if hemoglobin < 7.0:
        risk_score += 3
        risk_factors.append({'icon': 'RED', 'title': 'Severe Anemia', 'detail': f'Hb {hemoglobin} g/dL - needs immediate IV iron / transfusion'})
        recommendations.append('Refer to PHC/hospital IMMEDIATELY for IV iron therapy or blood transfusion.')
    elif hemoglobin < 10.0:
        risk_score += 2
        risk_factors.append({'icon': 'ORANGE', 'title': 'Moderate Anemia', 'detail': f'Hb {hemoglobin} g/dL (normal >11 g/dL) - needs oral iron therapy'})
        recommendations.append('Double IFA dose; ensure daily protein-rich diet (green leafy veg, jaggery, dal).')
    elif hemoglobin < 11.0:
        risk_score += 1
        risk_factors.append({'icon': 'YELLOW', 'title': 'Mild Anemia', 'detail': f'Hb {hemoglobin} g/dL - monitor weekly'})
        recommendations.append('Continue IFA tablets and high-iron diet. Recheck Hb after 4 weeks.')

    # Blood Pressure
    if systolic >= 160 or diastolic >= 110:
        risk_score += 4
        risk_factors.append({'icon': 'RED', 'title': 'Severe Hypertension / Pre-eclampsia Risk', 'detail': f'BP {systolic}/{diastolic} mmHg - DANGER ZONE'})
        recommendations.append('URGENT: Refer to hospital immediately. Risk of eclamptic seizure.')
    elif systolic >= 140 or diastolic >= 90:
        risk_score += 2
        risk_factors.append({'icon': 'ORANGE', 'title': 'Gestational Hypertension', 'detail': f'BP {systolic}/{diastolic} mmHg (normal <140/90)'})
        recommendations.append('Restrict salt; bed rest; recheck BP daily; refer to doctor within 24 hrs.')
    elif systolic < 90:
        risk_score += 1
        risk_factors.append({'icon': 'YELLOW', 'title': 'Low Blood Pressure', 'detail': f'BP {systolic}/{diastolic} - may cause dizziness/fainting'})
        recommendations.append('Increase fluid intake; avoid sudden standing; rest after meals.')

    # Age Risk
    if age < 18:
        risk_score += 3
        risk_factors.append({'icon': 'RED', 'title': 'Teenage Pregnancy (High Risk)', 'detail': f'Age {age} yrs - high risk of preterm birth, low birth weight'})
        recommendations.append('Mandatory referral to Medical Officer. Ensure all ANC visits at PHC.')
    elif age > 35:
        risk_score += 1
        risk_factors.append({'icon': 'YELLOW', 'title': 'Advanced Maternal Age', 'detail': f'Age {age} yrs - increased risk of hypertension, chromosomal abnormalities'})
        recommendations.append('Ensure Down syndrome screening; more frequent ANC visits.')

    # Gestational Diabetes
    if diabetes_hist:
        risk_score += 2
        risk_factors.append({'icon': 'ORANGE', 'title': 'Gestational Diabetes Risk', 'detail': 'History of diabetes - monitor blood sugar throughout pregnancy'})
        recommendations.append('Order 75g OGTT glucose test; reduce sweets/rice; morning walk 20 min daily.')

    # Preterm
    if weeks < 37 and gravida > 1:
        risk_score += 1
        risk_factors.append({'icon': 'YELLOW', 'title': 'Preterm Pregnancy', 'detail': f'{weeks} weeks gestation - monitor for early labour signs'})
        recommendations.append('Watch for contractions, spotting, or fluid leakage. Go to hospital immediately.')

    # Previous C-Section
    if prev_cs and gravida > 1:
        risk_score += 1
        risk_factors.append({'icon': 'YELLOW', 'title': 'Previous Caesarean', 'detail': 'Risk of uterine rupture in labour; plan institutional delivery only'})
        recommendations.append('Ensure delivery ONLY in a hospital with surgical facilities (NOT at home).')

    # BMI
    if height > 0:
        bmi = weight / ((height / 100) ** 2)
        if bmi > 30:
            risk_score += 1
            risk_factors.append({'icon': 'YELLOW', 'title': f'Obesity (BMI {bmi:.1f})', 'detail': 'Increases risk of GDM, hypertension, C-section'})
            recommendations.append('Gentle walking 20 min/day; avoid excess sweets and fried food.')

    # Danger symptoms
    DANGER = {
        'bleeding':         ('RED',    'Vaginal Bleeding',          'EMERGENCY - risk of placenta previa / abruption'),
        'convulsion':       ('RED',    'Convulsions / Fits',        'EMERGENCY - eclampsia needs immediate hospital care'),
        'severe headache':  ('RED',    'Severe Headache',           'May indicate pre-eclampsia / BP spike'),
        'blurred vision':   ('RED',    'Blurred Vision',            'Classic pre-eclampsia warning sign'),
        'no fetal movement':('RED',    'Reduced Fetal Movement',    'EMERGENCY - go to hospital for CTG immediately'),
        'swollen face':     ('ORANGE', 'Facial / Hand Swelling',    'Pre-eclampsia sign - check BP immediately'),
        'burning urine':    ('YELLOW', 'Burning Urination',         'UTI common in pregnancy - needs antibiotic treatment'),
    }
    for sym in symptoms:
        for key, (icon, title, detail) in DANGER.items():
            if key in sym.lower():
                risk_score += (3 if icon == 'RED' else 1)
                risk_factors.append({'icon': icon, 'title': title, 'detail': detail})
                if icon == 'RED':
                    recommendations.append(f'URGENT: Seek hospital immediately for {title}.')

    # Risk Level
    if risk_score >= 6:
        risk_level  = 'High Risk'
        risk_color  = '#e63946'
        risk_emoji  = 'RED'
        risk_action = 'IMMEDIATE REFERRAL to PHC/CHC/Hospital required. Do not delay.'
    elif risk_score >= 3:
        risk_level  = 'Moderate Risk'
        risk_color  = '#f4a261'
        risk_emoji  = 'ORANGE'
        risk_action = 'Increased monitoring needed. Visit PHC within 48 hours.'
    else:
        risk_level  = 'Low Risk'
        risk_color  = '#40916c'
        risk_emoji  = 'GREEN'
        risk_action = 'Continue routine ANC. Next visit as scheduled.'

    if not risk_factors:
        risk_factors.append({'icon': 'GREEN', 'title': 'No Major Risk Factors', 'detail': 'All parameters within normal range. Continue routine antenatal care.'})

    medicines = [
        {'name': 'Iron + Folic Acid (IFA) 100mg/500mcg', 'brand': 'Govt IFA Red Tablet / Ferrous Sulfate+FA',
         'type': 'Anemia Prevention (WHO mandated)', 'dose': '1 tablet', 'frequency': 'Once daily (after dinner)',
         'duration': 'Throughout pregnancy + 6 months postpartum',
         'warning': 'Take with Vitamin C (lemon water); avoid tea/milk within 1 hr (reduces absorption)'},
        {'name': 'Calcium 500mg', 'brand': 'Govt Calcium Tablet / Shelcal 500',
         'type': 'Bone and BP protection', 'dose': '1 tablet', 'frequency': 'Twice daily',
         'duration': 'From 20 weeks to delivery',
         'warning': 'Do NOT take at same time as IFA - separate by 2 hours'},
        {'name': 'Vitamin D3 60,000 IU', 'brand': 'D-Rise / Uprise-D3',
         'type': 'Bone and immunity', 'dose': '1 sachet dissolved in water', 'frequency': 'Once a month',
         'duration': '5 months (20-36 weeks)',
         'warning': 'Take with fatty meal for absorption. Available free at PHC.'},
        {'name': 'Tetanus Toxoid (TT) Vaccine', 'brand': 'Govt supplied at PHC (Free)',
         'type': 'Infection prevention for mother and baby', 'dose': '0.5 mL injection',
         'frequency': 'TT1 at first ANC contact, TT2 four weeks later',
         'duration': 'Protects until next pregnancy', 'warning': 'Given free at all PHCs and ASHA centers'},
    ]

    if systolic >= 140 or diastolic >= 90:
        medicines.append({
            'name': 'Methyldopa 250mg', 'brand': 'Alphadopa / Dopamet',
            'type': 'Safe antihypertensive in pregnancy', 'dose': '1 tablet',
            'frequency': '2-3 times daily (as per doctor)', 'duration': 'As prescribed',
            'warning': 'NEVER use ACE inhibitors or ARBs in pregnancy - they are DANGEROUS to baby'
        })

    emergency_signs = [
        {'level': 'RED', 'text': 'Vaginal bleeding at any time'},
        {'level': 'RED', 'text': 'Fits / loss of consciousness'},
        {'level': 'RED', 'text': 'Severe headache + blurred vision'},
        {'level': 'RED', 'text': 'No baby movement for more than 12 hours'},
        {'level': 'RED', 'text': 'High fever (above 38.5 C) with chills'},
        {'level': 'ORANGE', 'text': 'Hands and face swelling (especially morning)'},
        {'level': 'ORANGE', 'text': 'Burning urine or discharge with smell'},
        {'level': 'ORANGE', 'text': 'Breathlessness even at rest'},
    ]

    anc_checklist = [
        {'week': 'Before 12 weeks', 'tasks': [
            'Register pregnancy at ASHA / ANM / PHC',
            'Blood group and Rh factor test',
            'Hemoglobin (Hb) test',
            'Urine test (protein, sugar)',
            'BP and weight check',
            'TT-1 injection',
            'Start IFA + Calcium tablets'
        ]},
        {'week': '14-20 weeks', 'tasks': [
            'Anomaly scan (Level 2 USG)',
            'Double / Triple Marker test (Down syndrome)',
            'Check weight gain (0.5 kg/week expected)',
            'TT-2 injection',
            'Repeat Hb test'
        ]},
        {'week': '24-28 weeks', 'tasks': [
            '75g OGTT (Gestational Diabetes test)',
            'Hemoglobin recheck',
            'Baby movement charting',
            'BP monitoring twice weekly'
        ]},
        {'week': '32-36 weeks', 'tasks': [
            'Growth scan USG',
            'Identify and register at delivery hospital',
            'Birth preparedness plan',
            'Danger signs counselling for family'
        ]},
        {'week': 'After Delivery', 'tasks': [
            'Continue IFA for 6 months postpartum',
            'Breastfeed within 1 hour of birth',
            'Baby immunization (BCG, OPV, Hep-B on Day 0)',
            'Family planning counselling at 6-week visit'
        ]},
    ]

    return jsonify({
        'risk_level':     risk_level,
        'risk_color':     risk_color,
        'risk_emoji':     risk_emoji,
        'risk_score':     risk_score,
        'risk_action':    risk_action,
        'risk_factors':   risk_factors,
        'recommendations': recommendations,
        'medicines':      medicines,
        'emergency_signs': emergency_signs,
        'anc_checklist':  anc_checklist,
    })

'''

with open('d:/hackthon/backend/app_utf8_clean.py', 'r', encoding='utf-8') as f:
    content = f.read()

marker = "# -- Maternal"
if marker in content:
    print("Endpoint already present - skipping insert")
else:
    # Insert before the Image Diagnosis section
    insert_before = "# -- Image Diagnosis using Gemini Vision"
    if insert_before not in content:
        # Fallback: insert before the last if __name__
        insert_before = "if __name__ == '__main__':"
    pos = content.find(insert_before)
    new_content = content[:pos] + MATERNAL_CODE + content[pos:]
    with open('d:/hackthon/backend/app_utf8_clean.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: maternal endpoint inserted")

print("Done")
