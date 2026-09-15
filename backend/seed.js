import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Staff from './models/Staff.js';
import Test from './models/Test.js';
import Report from './models/Report.js';
import Billing from './models/Billing.js';
import Payment from './models/Payment.js';
import Salary from './models/Salary.js';
import Announcement from './models/Announcement.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Staff.deleteMany({});
    await Test.deleteMany({});
    await Report.deleteMany({});
    await Billing.deleteMany({});
    await Payment.deleteMany({});
    await Salary.deleteMany({});
    await Announcement.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    console.log('🌱 Starting database seeding...\n');

    // Step 1: Create Admin User
    console.log('👤 Creating Admin...');
    const admin = await User.create({
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '1234567890',
      isActive: true,
      isEmailVerified: true,
    });
    console.log('✅ Admin created:', admin.email);

    // Step 2: Create Doctors
    console.log('\n👨‍⚕️ Creating Doctors...');
    const doctorsData = [
      {
        email: 'dr.ahmed@hospital.com',
        password: 'doctor123',
        firstName: 'Ahmed',
        lastName: 'Khan',
        phone: '03001234567',
        specialization: 'Cardiology',
        qualification: 'MBBS, FCPS (Cardiology)',
        experience: 15,
        department: 'Cardiology',
        consultationFee: 3000,
        salary: 250000,
      },
      {
        email: 'dr.fatima@hospital.com',
        password: 'doctor123',
        firstName: 'Fatima',
        lastName: 'Ali',
        phone: '03001234568',
        specialization: 'Neurology',
        qualification: 'MBBS, FCPS (Neurology)',
        experience: 12,
        department: 'Neurology',
        consultationFee: 3500,
        salary: 280000,
      },
      {
        email: 'dr.hassan@hospital.com',
        password: 'doctor123',
        firstName: 'Hassan',
        lastName: 'Malik',
        phone: '03001234569',
        specialization: 'Orthopedics',
        qualification: 'MBBS, FCPS (Orthopedics)',
        experience: 10,
        department: 'Orthopedics',
        consultationFee: 2500,
        salary: 220000,
      },
      {
        email: 'dr.ayesha@hospital.com',
        password: 'doctor123',
        firstName: 'Ayesha',
        lastName: 'Siddiqui',
        phone: '03001234570',
        specialization: 'Pediatrics',
        qualification: 'MBBS, FCPS (Pediatrics)',
        experience: 8,
        department: 'Pediatrics',
        consultationFee: 2000,
        salary: 200000,
      },
      {
        email: 'dr.usman@hospital.com',
        password: 'doctor123',
        firstName: 'Usman',
        lastName: 'Raza',
        phone: '03001234571',
        specialization: 'General Medicine',
        qualification: 'MBBS, FCPS',
        experience: 20,
        department: 'General Medicine',
        consultationFee: 1500,
        salary: 230000,
      },
    ];

    const doctors = [];
    for (const docData of doctorsData) {
      const { specialization, qualification, experience, department, consultationFee, salary, ...userData } = docData;
      const user = await User.create({ ...userData, role: 'doctor' });
      
      // Get count for doctorId
      const doctorCount = await Doctor.countDocuments();
      
      const doctor = await Doctor.create({
        user: user._id,
        doctorId: `DOC${String(doctorCount + 1).padStart(6, '0')}`,
        specialization,
        qualification,
        experience,
        department,
        consultationFee,
        salary,
        licenseNumber: `LIC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' },
        ],
      });
      doctors.push(doctor);
      console.log(`✅ Doctor created: Dr. ${user.firstName} ${user.lastName} (${specialization})`);
    }

    // Step 3: Create Staff
    console.log('\n👥 Creating Staff...');
    const staffData = [
      {
        email: 'nurse.zainab@hospital.com',
        password: 'staff123',
        firstName: 'Zainab',
        lastName: 'Hussain',
        phone: '03009876543',
        position: 'Senior Nurse',
        department: 'Emergency',
        salary: 60000,
        shift: 'morning',
      },
      {
        email: 'receptionist.sana@hospital.com',
        password: 'staff123',
        firstName: 'Sana',
        lastName: 'Ahmed',
        phone: '03009876544',
        position: 'Receptionist',
        department: 'Administration',
        salary: 40000,
        shift: 'morning',
      },
      {
        email: 'technician.bilal@hospital.com',
        password: 'staff123',
        firstName: 'Bilal',
        lastName: 'Tariq',
        phone: '03009876545',
        position: 'Lab Technician',
        department: 'Laboratory',
        salary: 55000,
        shift: 'evening',
      },
      {
        email: 'pharmacist.hira@hospital.com',
        password: 'staff123',
        firstName: 'Hira',
        lastName: 'Noor',
        phone: '03009876546',
        position: 'Pharmacist',
        department: 'Pharmacy',
        salary: 70000,
        shift: 'morning',
      },
    ];

    const staffMembers = [];
    for (const staffInfo of staffData) {
      const { position, department, salary, shift, ...userData } = staffInfo;
      const user = await User.create({ ...userData, role: 'staff' });
      
      // Get count for staffId
      const staffCount = await Staff.countDocuments();
      
      // Generate shift schedule for next 30 days
      const shiftSchedule = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + i);
        
        // Determine shift based on day of week
        const dayOfWeek = scheduleDate.getDay();
        let dayShift = shift;
        let startTime = '09:00';
        let endTime = '17:00';
        
        if (shift === 'morning') {
          startTime = '08:00';
          endTime = '16:00';
        } else if (shift === 'evening') {
          startTime = '16:00';
          endTime = '00:00';
        } else if (shift === 'night') {
          startTime = '00:00';
          endTime = '08:00';
        }
        
        // Sunday is off
        if (dayOfWeek === 0) {
          dayShift = 'off';
          startTime = '';
          endTime = '';
        }
        
        shiftSchedule.push({
          date: scheduleDate,
          shift: dayShift,
          startTime,
          endTime,
        });
      }
      
      const staff = await Staff.create({
        user: user._id,
        staffId: `STF${String(staffCount + 1).padStart(6, '0')}`,
        position,
        department,
        salary,
        shift,
        employeeType: 'full-time',
        shiftSchedule,
      });
      staffMembers.push(staff);
      console.log(`✅ Staff created: ${user.firstName} ${user.lastName} (${position})`);
    }

    // Step 4: Create Patients
    console.log('\n🏥 Creating Patients...');
    const patientsData = [
      {
        email: 'patient1@email.com',
        password: 'patient123',
        firstName: 'Ali',
        lastName: 'Raza',
        phone: '03101234567',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        bloodGroup: 'O+',
        assignedDoctor: doctors[0]._id,
      },
      {
        email: 'patient2@email.com',
        password: 'patient123',
        firstName: 'Maryam',
        lastName: 'Shahid',
        phone: '03101234568',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'female',
        bloodGroup: 'A+',
        assignedDoctor: doctors[1]._id,
      },
      {
        email: 'patient3@email.com',
        password: 'patient123',
        firstName: 'Hamza',
        lastName: 'Iqbal',
        phone: '03101234569',
        dateOfBirth: new Date('1978-12-10'),
        gender: 'male',
        bloodGroup: 'B+',
        assignedDoctor: doctors[2]._id,
      },
      {
        email: 'patient4@email.com',
        password: 'patient123',
        firstName: 'Zara',
        lastName: 'Farooq',
        phone: '03101234570',
        dateOfBirth: new Date('1995-03-18'),
        gender: 'female',
        bloodGroup: 'AB+',
        assignedDoctor: doctors[3]._id,
      },
      {
        email: 'patient5@email.com',
        password: 'patient123',
        firstName: 'Imran',
        lastName: 'Saeed',
        phone: '03101234571',
        dateOfBirth: new Date('1982-07-25'),
        gender: 'male',
        bloodGroup: 'O-',
        assignedDoctor: doctors[4]._id,
      },
      {
        email: 'patient6@email.com',
        password: 'patient123',
        firstName: 'Nida',
        lastName: 'Yousaf',
        phone: '9876543235',
        dateOfBirth: new Date('1988-11-30'),
        gender: 'female',
        bloodGroup: 'A-',
        assignedDoctor: doctors[0]._id,
      },
    ];

    const patients = [];
    for (const patData of patientsData) {
      const { dateOfBirth, gender, bloodGroup, assignedDoctor, ...userData } = patData;
      const user = await User.create({ ...userData, role: 'patient' });
      
      // Get count for patientId
      const patientCount = await Patient.countDocuments();
      
      const patient = await Patient.create({
        user: user._id,
        patientId: `PAT${String(patientCount + 1).padStart(6, '0')}`,
        dateOfBirth,
        gender,
        bloodGroup,
        assignedDoctor,
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '9999999999',
        },
        allergies: ['Penicillin'],
        currentMedications: ['Aspirin'],
      });
      patients.push(patient);
      console.log(`✅ Patient created: ${user.firstName} ${user.lastName}`);
    }

    // Step 5: Create Tests
    console.log('\n🧪 Creating Tests...');
    const testsData = [
      {
        testName: 'Complete Blood Count (CBC)',
        category: 'Blood Test',
        description: 'Measures different components of blood',
        price: 500,
        duration: '2-4 hours',
        preparationInstructions: 'Fasting for 8-12 hours recommended',
        normalRange: 'WBC: 4,000-11,000, RBC: 4.5-5.5 million',
      },
      {
        testName: 'Lipid Profile',
        category: 'Blood Test',
        description: 'Measures cholesterol and triglycerides',
        price: 800,
        duration: '4-6 hours',
        preparationInstructions: 'Fasting for 12 hours required',
        normalRange: 'Total Cholesterol: <200 mg/dL',
      },
      {
        testName: 'Chest X-Ray',
        category: 'Imaging',
        description: 'X-ray imaging of chest area',
        price: 1200,
        duration: '30 minutes',
        preparationInstructions: 'Remove metal objects',
        normalRange: 'No abnormalities detected',
      },
      {
        testName: 'ECG (Electrocardiogram)',
        category: 'Cardiology',
        description: 'Records electrical activity of heart',
        price: 1000,
        duration: '15-30 minutes',
        preparationInstructions: 'No special preparation',
        normalRange: 'Normal sinus rhythm',
      },
      {
        testName: 'Urine Routine',
        category: 'Urine Test',
        description: 'Basic urine analysis',
        price: 300,
        duration: '1-2 hours',
        preparationInstructions: 'First morning sample preferred',
        normalRange: 'pH: 4.5-8.0, No protein/glucose',
      },
      {
        testName: 'Blood Sugar (Fasting)',
        category: 'Blood Test',
        description: 'Measures fasting blood glucose',
        price: 200,
        duration: '2 hours',
        preparationInstructions: 'Fasting for 8-10 hours required',
        normalRange: '70-100 mg/dL',
      },
      {
        testName: 'Thyroid Function Test',
        category: 'Blood Test',
        description: 'Measures thyroid hormone levels',
        price: 900,
        duration: '4-6 hours',
        preparationInstructions: 'No special preparation',
        normalRange: 'TSH: 0.4-4.0 mIU/L',
      },
      {
        testName: 'MRI Scan',
        category: 'Imaging',
        description: 'Magnetic resonance imaging',
        price: 5000,
        duration: '45-60 minutes',
        preparationInstructions: 'Remove all metal objects',
        normalRange: 'No abnormalities detected',
      },
    ];

    const tests = [];
    for (const testData of testsData) {
      // Get count for testCode
      const testCount = await Test.countDocuments();
      
      const test = await Test.create({ 
        ...testData, 
        testCode: `TST${String(testCount + 1).padStart(6, '0')}`,
        createdBy: admin._id 
      });
      tests.push(test);
      console.log(`✅ Test created: ${test.testName}`);
    }

    // Step 6: Create Reports
    console.log('\n📋 Creating Reports...');
    const reportsData = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        test: tests[0]._id,
        status: 'completed',
        findings: 'All blood parameters within normal range',
        results: [
          { parameter: 'WBC', value: '8500', unit: 'cells/mcL', normalRange: '4000-11000', status: 'normal' },
          { parameter: 'RBC', value: '5.2', unit: 'million cells/mcL', normalRange: '4.5-5.5', status: 'normal' },
          { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' },
        ],
        diagnosis: 'Normal blood count',
        recommendations: 'Continue regular health monitoring',
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        test: tests[1]._id,
        status: 'completed',
        findings: 'Slightly elevated cholesterol levels',
        results: [
          { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', normalRange: '<200', status: 'abnormal' },
          { parameter: 'LDL', value: '140', unit: 'mg/dL', normalRange: '<100', status: 'abnormal' },
          { parameter: 'HDL', value: '45', unit: 'mg/dL', normalRange: '>40', status: 'normal' },
        ],
        diagnosis: 'Hyperlipidemia',
        recommendations: 'Diet modification and exercise. Follow-up in 3 months',
      },
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        test: tests[2]._id,
        status: 'completed',
        findings: 'Clear lung fields, normal heart size',
        diagnosis: 'Normal chest X-ray',
        recommendations: 'No further action required',
      },
      {
        patient: patients[3]._id,
        doctor: doctors[3]._id,
        test: tests[3]._id,
        status: 'completed',
        findings: 'Normal sinus rhythm, no arrhythmias detected',
        diagnosis: 'Normal ECG',
        recommendations: 'Continue regular cardiac monitoring',
      },
      {
        patient: patients[4]._id,
        doctor: doctors[4]._id,
        test: tests[5]._id,
        status: 'completed',
        findings: 'Fasting blood sugar within normal limits',
        results: [
          { parameter: 'Glucose', value: '92', unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
        ],
        diagnosis: 'Normal blood sugar',
        recommendations: 'Maintain healthy lifestyle',
      },
    ];

    const reports = [];
    for (const reportData of reportsData) {
      // Get count for reportId
      const reportCount = await Report.countDocuments();
      
      const report = await Report.create({
        ...reportData,
        reportId: `RPT${String(reportCount + 1).padStart(6, '0')}`,
      });
      reports.push(report);
      console.log(`✅ Report created: ${report.reportId}`);
    }

    // Step 7: Create Billing
    console.log('\n💰 Creating Billing Records...');
    const billingsData = [
      {
        patient: patients[0]._id,
        items: [
          {
            itemType: 'test',
            description: 'Complete Blood Count (CBC)',
            quantity: 1,
            unitPrice: 500,
            totalPrice: 500,
          },
          {
            itemType: 'consultation',
            description: 'Cardiology Consultation',
            quantity: 1,
            unitPrice: 1500,
            totalPrice: 1500,
          },
        ],
        subtotal: 2000,
        tax: 200,
        discount: 0,
        totalAmount: 2200,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        patient: patients[1]._id,
        items: [
          {
            itemType: 'test',
            description: 'Lipid Profile',
            quantity: 1,
            unitPrice: 800,
            totalPrice: 800,
          },
          {
            itemType: 'consultation',
            description: 'Neurology Consultation',
            quantity: 1,
            unitPrice: 1800,
            totalPrice: 1800,
          },
        ],
        subtotal: 2600,
        tax: 260,
        discount: 100,
        totalAmount: 2760,
        paidAmount: 2760,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        patient: patients[2]._id,
        items: [
          {
            itemType: 'test',
            description: 'Chest X-Ray',
            quantity: 1,
            unitPrice: 1200,
            totalPrice: 1200,
          },
        ],
        subtotal: 1200,
        tax: 120,
        discount: 0,
        totalAmount: 1320,
        paidAmount: 500,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        patient: patients[3]._id,
        items: [
          {
            itemType: 'test',
            description: 'ECG (Electrocardiogram)',
            quantity: 1,
            unitPrice: 1000,
            totalPrice: 1000,
          },
          {
            itemType: 'consultation',
            description: 'Pediatrics Consultation',
            quantity: 1,
            unitPrice: 1000,
            totalPrice: 1000,
          },
        ],
        subtotal: 2000,
        tax: 200,
        discount: 50,
        totalAmount: 2150,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        patient: patients[4]._id,
        items: [
          {
            itemType: 'test',
            description: 'Blood Sugar (Fasting)',
            quantity: 1,
            unitPrice: 200,
            totalPrice: 200,
          },
        ],
        subtotal: 200,
        tax: 20,
        discount: 0,
        totalAmount: 220,
        paidAmount: 220,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
    ];

    const billings = [];
    for (const billData of billingsData) {
      // Get count for billId
      const billCount = await Billing.countDocuments();
      
      const billing = await Billing.create({
        ...billData,
        billId: `BILL${String(billCount + 1).padStart(6, '0')}`,
      });
      billings.push(billing);
      console.log(`✅ Billing created: ${billing.billId} - Amount: ₹${billing.totalAmount}`);
    }

    // Step 8: Create Payments
    console.log('\n💳 Creating Payments...');
    const paymentsData = [
      {
        patient: patients[1]._id,
        billing: billings[1]._id,
        amount: 2760,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        transactionId: `TXN${Date.now()}ABC123`,
        cardDetails: {
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
        },
        paymentDate: new Date(),
      },
      {
        patient: patients[2]._id,
        billing: billings[2]._id,
        amount: 500,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        transactionId: `TXN${Date.now()}DEF456`,
        cardDetails: {
          last4: '5555',
          brand: 'Mastercard',
          expiryMonth: 10,
          expiryYear: 2026,
        },
        paymentDate: new Date(),
      },
      {
        patient: patients[4]._id,
        billing: billings[4]._id,
        amount: 220,
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        transactionId: `TXN${Date.now()}GHI789`,
        paymentDate: new Date(),
      },
    ];

    const payments = [];
    for (const payData of paymentsData) {
      // Get count for paymentId
      const paymentCount = await Payment.countDocuments();
      
      const payment = await Payment.create({
        ...payData,
        paymentId: `PAY${String(paymentCount + 1).padStart(6, '0')}`,
      });
      payments.push(payment);
      console.log(`✅ Payment created: ${payment.paymentId} - ₹${payment.amount}`);
    }

    // Step 9: Create Salaries
    console.log('\n💵 Creating Salary Records...');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const salariesData = [];
    
    // Current month salaries for doctors
    for (const doctor of doctors) {
      const doctorUser = await User.findById(doctor.user);
      const baseSalary = doctor.salary;
      const allowances = 5000;
      const bonuses = 10000;
      const deductions = 2000;
      const netSalary = baseSalary + allowances + bonuses - deductions;
      
      salariesData.push({
        employee: doctorUser._id,
        employeeType: 'doctor',
        month: currentMonth,
        year: currentYear,
        baseSalary,
        allowances,
        bonuses,
        deductions,
        netSalary,
        paymentStatus: 'pending',
        createdBy: admin._id,
      });
    }

    // Last month salaries for doctors (paid)
    for (const doctor of doctors) {
      const doctorUser = await User.findById(doctor.user);
      const baseSalary = doctor.salary;
      const allowances = 5000;
      const bonuses = 8000;
      const deductions = 2000;
      const netSalary = baseSalary + allowances + bonuses - deductions;
      
      salariesData.push({
        employee: doctorUser._id,
        employeeType: 'doctor',
        month: lastMonth,
        year: lastMonthYear,
        baseSalary,
        allowances,
        bonuses,
        deductions,
        netSalary,
        paymentStatus: 'paid',
        paymentDate: new Date(lastMonthYear, lastMonth - 1, 28),
        createdBy: admin._id,
      });
    }

    // Current month salaries for staff
    for (const staff of staffMembers) {
      const staffUser = await User.findById(staff.user);
      const baseSalary = staff.salary;
      const allowances = 2000;
      const bonuses = 3000;
      const deductions = 1000;
      const netSalary = baseSalary + allowances + bonuses - deductions;
      
      salariesData.push({
        employee: staffUser._id,
        employeeType: 'staff',
        month: currentMonth,
        year: currentYear,
        baseSalary,
        allowances,
        bonuses,
        deductions,
        netSalary,
        paymentStatus: 'pending',
        createdBy: admin._id,
      });
    }

    const salaries = [];
    for (const salData of salariesData) {
      // Get count for salaryId
      const salaryCount = await Salary.countDocuments();
      
      const salary = await Salary.create({
        ...salData,
        salaryId: `SAL${String(salaryCount + 1).padStart(6, '0')}`,
      });
      salaries.push(salary);
      const emp = await User.findById(salData.employee);
      console.log(`✅ Salary created: ${emp.firstName} ${emp.lastName} - ${salData.month}/${salData.year} - ₹${salary.netSalary}`);
    }

    // Step 10: Create Announcements
    console.log('\n📢 Creating Announcements...');
    const announcementsData = [
      {
        title: 'Hospital Maintenance Schedule',
        message: 'The hospital will undergo routine maintenance on Sunday from 2 AM to 6 AM. Emergency services will remain operational.',
        type: 'maintenance',
        priority: 'medium',
        targetAudience: ['all'],
        createdBy: admin._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'New COVID-19 Guidelines',
        message: 'Updated COVID-19 safety protocols are now in effect. Please wear masks in all common areas and maintain social distancing.',
        type: 'urgent',
        priority: 'high',
        targetAudience: ['all'],
        createdBy: admin._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Free Health Checkup Camp',
        message: 'Free health checkup camp for senior citizens on 15th of this month. Registration required.',
        type: 'event',
        priority: 'medium',
        targetAudience: ['patient'],
        createdBy: admin._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Staff Training Program',
        message: 'Mandatory training program for all staff members on new hospital management system. Date: Next Monday, 10 AM.',
        type: 'general',
        priority: 'high',
        targetAudience: ['staff', 'doctor'],
        createdBy: admin._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Updated Visiting Hours',
        message: 'New visiting hours: 4 PM to 7 PM daily. Maximum 2 visitors per patient.',
        type: 'policy',
        priority: 'medium',
        targetAudience: ['all'],
        createdBy: admin._id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ];

    const announcements = [];
    for (const annData of announcementsData) {
      // Get count for announcementId
      const annCount = await Announcement.countDocuments();
      
      const announcement = await Announcement.create({
        ...annData,
        announcementId: `ANN${String(annCount + 1).padStart(6, '0')}`,
      });
      announcements.push(announcement);
      console.log(`✅ Announcement created: ${announcement.title}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   👤 Admin: 1`);
    console.log(`   👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`   👥 Staff: ${staffMembers.length}`);
    console.log(`   🏥 Patients: ${patients.length}`);
    console.log(`   🧪 Tests: ${tests.length}`);
    console.log(`   📋 Reports: ${reports.length}`);
    console.log(`   💰 Billings: ${billings.length}`);
    console.log(`   💳 Payments: ${payments.length}`);
    console.log(`   💵 Salaries: ${salaries.length}`);
    console.log(`   📢 Announcements: ${announcements.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@hospital.com');
    console.log('     Password: admin123');
    console.log('\n   Doctor (Sample):');
    console.log('     Email: dr.smith@hospital.com');
    console.log('     Password: doctor123');
    console.log('\n   Staff (Sample):');
    console.log('     Email: nurse.mary@hospital.com');
    console.log('     Password: staff123');
    console.log('\n   Patient (Sample):');
    console.log('     Email: patient1@email.com');
    console.log('     Password: patient123');
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seed
seedDatabase();
