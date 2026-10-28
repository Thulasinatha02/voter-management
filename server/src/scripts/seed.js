require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ward = require('../models/Ward');
const Family = require('../models/Family');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ward_management_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Ward.deleteMany({}),
      Family.deleteMany({}),
      Member.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Existing collections cleared');

    // 1. Create Default Administrative Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      username: 'admin',
      password: passwordHash,
      fullName: 'Chief Election Officer',
      email: 'admin@wardportal.gov.in',
      role: 'superadmin',
      isActive: true,
    });

    const operator = await User.create({
      username: 'operator',
      password: passwordHash,
      fullName: 'Field Data Operator',
      email: 'operator@wardportal.gov.in',
      role: 'data_operator',
      isActive: true,
    });

    console.log('[Seed] Admin & Operator users created');

    // 2. Create Wards
    const wards = await Ward.create([
      {
        wardCode: 'WARD-01',
        wardName: 'North Central Ward 01',
        locality: 'Civil Lines & Station Road',
        district: 'Central Metro',
        zone: 'North Zone',
        totalPopulationEstimate: 14500,
        createdBy: admin._id,
      },
      {
        wardCode: 'WARD-02',
        wardName: 'Riverside Ward 02',
        locality: 'Ganga Enclave & Green Park',
        district: 'Central Metro',
        zone: 'East Zone',
        totalPopulationEstimate: 18200,
        createdBy: admin._id,
      },
      {
        wardCode: 'WARD-03',
        wardName: 'Industrial Crescent 03',
        locality: 'Market Square & Mill Area',
        district: 'Industrial Outer',
        zone: 'South Zone',
        totalPopulationEstimate: 22000,
        createdBy: admin._id,
      },
      {
        wardCode: 'WARD-04',
        wardName: 'Highland Gardens 04',
        locality: 'Hill View Colony & Lake Road',
        district: 'Suburban Hill',
        zone: 'West Zone',
        totalPopulationEstimate: 9800,
        createdBy: admin._id,
      },
    ]);

    console.log(`[Seed] ${wards.length} Wards seeded`);

    // Assign operator to Ward 1 and 2
    operator.assignedWards = [wards[0]._id, wards[1]._id];
    await operator.save();

    // 3. Seed Realistic Families and Members for Ward 1
    const ward1 = wards[0];
    const sampleFamiliesData = [
      {
        head: 'Rajesh Kumar Verma',
        label: 'Verma Residence',
        house: '12-A',
        street: 'Civil Lines Road',
        locality: 'Civil Lines',
        phone: '9876543210',
        status: 'complete',
        members: [
          { name: 'Rajesh Kumar Verma', gender: 'male', age: 48, rel: 'head', occ: 'School Teacher' },
          { name: 'Sunita Verma', gender: 'female', age: 45, rel: 'spouse', occ: 'Homemaker' },
          { name: 'Amit Verma', gender: 'male', age: 21, rel: 'son', occ: 'Student' },
          { name: 'Pooja Verma', gender: 'female', age: 17, rel: 'daughter', occ: 'Student' },
        ],
      },
      {
        head: 'Anand Prakash Mehta',
        label: 'Mehta Household',
        house: '45/2',
        street: 'Station Link Road',
        locality: 'Station Road',
        phone: '9812345678',
        status: 'complete',
        members: [
          { name: 'Anand Prakash Mehta', gender: 'male', age: 62, rel: 'head', occ: 'Retired Officer' },
          { name: 'Kavita Mehta', gender: 'female', age: 58, rel: 'spouse', occ: 'Homemaker' },
          { name: 'Rohit Mehta', gender: 'male', age: 32, rel: 'son', occ: 'Software Engineer' },
        ],
      },
      {
        head: 'Meenakshi Sundaram',
        label: 'Sundaram Nilayam',
        house: '78',
        street: 'Temple View Marg',
        locality: 'Civil Lines',
        phone: '9845012345',
        status: 'incomplete',
        members: [
          { name: 'Meenakshi Sundaram', gender: 'female', age: 54, rel: 'head', occ: 'Accountant' },
          { name: 'Karthik Sundaram', gender: 'male', age: 26, rel: 'son', occ: 'Pharmacist' },
        ],
      },
      {
        head: 'Gurpreet Singh Gill',
        label: 'Gill Farm House',
        house: '104',
        street: 'Old Court Lane',
        locality: 'Station Road',
        phone: '9789012345',
        status: 'complete',
        members: [
          { name: 'Gurpreet Singh Gill', gender: 'male', age: 50, rel: 'head', occ: 'Business' },
          { name: 'Jasleen Kaur Gill', gender: 'female', age: 46, rel: 'spouse', occ: 'Lecturer' },
          { name: 'Simran Gill', gender: 'female', age: 22, rel: 'daughter', occ: 'Medical Intern' },
          { name: 'Harjot Gill', gender: 'male', age: 19, rel: 'son', occ: 'Student' },
          { name: 'Darshan Singh', gender: 'male', age: 76, rel: 'father', occ: 'Retired' },
        ],
      },
      {
        head: 'Farhan Ahmad Khan',
        label: 'Khan Manzil',
        house: '88-B',
        street: 'Bazaar Gate',
        locality: 'Civil Lines',
        phone: '9654321987',
        status: 'incomplete',
        members: [
          { name: 'Farhan Ahmad Khan', gender: 'male', age: 39, rel: 'head', occ: 'Retailer' },
        ],
      },
    ];

    for (let i = 0; i < sampleFamiliesData.length; i++) {
      const famData = sampleFamiliesData[i];
      const famCode = `FAM-W01-${100 + i + 1}`;

      const family = await Family.create({
        familyCode: famCode,
        wardId: ward1._id,
        headOfFamilyName: famData.head,
        familyLabel: famData.label,
        houseNo: famData.house,
        street: famData.street,
        locality: famData.locality,
        contactPhone: famData.phone,
        status: famData.status,
        memberCount: famData.members.length,
        createdBy: admin._id,
      });

      const memberDocs = famData.members.map((m, idx) => ({
        memberCode: `MEM-W01-${Date.now().toString().slice(-4)}-${i}${idx + 1}`,
        familyId: family._id,
        wardId: ward1._id,
        fullName: m.name,
        gender: m.gender,
        age: m.age,
        relationship: m.rel,
        mobilePhone: m.rel === 'head' ? famData.phone : '',
        occupation: m.occ,
        status: 'complete',
        isVoterEligible: m.age >= 18,
        createdBy: admin._id,
      }));

      await Member.insertMany(memberDocs);
    }

    // Seed realistic families for Ward 2
    const ward2 = wards[1];
    const fam2 = await Family.create({
      familyCode: 'FAM-W02-101',
      wardId: ward2._id,
      headOfFamilyName: 'Suresh Chandra Roy',
      familyLabel: 'Roy Villa',
      houseNo: '5',
      street: 'Ganga Path',
      locality: 'Ganga Enclave',
      contactPhone: '9811122233',
      status: 'complete',
      memberCount: 3,
      createdBy: admin._id,
    });

    await Member.insertMany([
      {
        memberCode: `MEM-W02-${Date.now().toString().slice(-4)}-01`,
        familyId: fam2._id,
        wardId: ward2._id,
        fullName: 'Suresh Chandra Roy',
        gender: 'male',
        age: 52,
        relationship: 'head',
        mobilePhone: '9811122233',
        occupation: 'Civil Contractor',
        status: 'complete',
        isVoterEligible: true,
        createdBy: admin._id,
      },
      {
        memberCode: `MEM-W02-${Date.now().toString().slice(-4)}-02`,
        familyId: fam2._id,
        wardId: ward2._id,
        fullName: 'Mousumi Roy',
        gender: 'female',
        age: 47,
        relationship: 'spouse',
        occupation: 'Teacher',
        status: 'complete',
        isVoterEligible: true,
        createdBy: admin._id,
      },
      {
        memberCode: `MEM-W02-${Date.now().toString().slice(-4)}-03`,
        familyId: fam2._id,
        wardId: ward2._id,
        fullName: 'Debanjan Roy',
        gender: 'male',
        age: 23,
        relationship: 'son',
        occupation: 'Data Analyst',
        status: 'complete',
        isVoterEligible: true,
        createdBy: admin._id,
      },
    ]);

    // Seed initial Audit Log
    await AuditLog.create({
      userId: admin._id,
      username: admin.username,
      action: 'SYSTEM_INIT',
      entityType: 'System',
      entityId: '0',
      details: { message: 'Administrative seed database initialized' },
      ipAddress: '127.0.0.1',
    });

    console.log('[Seed] Database successfully seeded with test administrative data!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
