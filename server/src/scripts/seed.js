require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ward = require('../models/Ward');
const Party = require('../models/Party');
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
      Party.deleteMany({}),
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

    // 2. Create Default Political Parties
    const parties = await Party.create([
      {
        partyName: 'Dravida Munnetra Kazhagam',
        partyCode: 'DMK',
        description: 'Major regional democratic political party',
        createdBy: admin._id,
      },
      {
        partyName: 'All India Anna Dravida Munnetra Kazhagam',
        partyCode: 'AIADMK',
        description: 'Major regional democratic political party',
        createdBy: admin._id,
      },
      {
        partyName: 'Bharatiya Janata Party',
        partyCode: 'BJP',
        description: 'National political party',
        createdBy: admin._id,
      },
      {
        partyName: 'Indian National Congress',
        partyCode: 'INC',
        description: 'National political party',
        createdBy: admin._id,
      },
      {
        partyName: 'Aam Aadmi Party',
        partyCode: 'AAP',
        description: 'Recognized national political party',
        createdBy: admin._id,
      },
    ]);
    console.log(`[Seed] ${parties.length} Political Parties created`);

    // 3. Create Wards
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

    // 4. Seed Realistic Families and Members for Ward 1
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
        religion: 'Hindu',
        boothNo: 'Booth 01',
        members: [
          {
            sl: '101',
            name: 'Rajesh Kumar Verma',
            voterId: 'TN/01/001/1001',
            guardian: 'Ram Prasad Verma',
            gender: 'male',
            age: 48,
            rel: 'head',
            occ: 'School Teacher',
            party: parties[0]._id,
          },
          {
            sl: '102',
            name: 'Sunita Verma',
            voterId: 'TN/01/001/1002',
            guardian: 'Rajesh Kumar Verma',
            gender: 'female',
            age: 45,
            rel: 'spouse',
            occ: 'Homemaker',
            party: parties[0]._id,
          },
          {
            sl: '103',
            name: 'Amit Verma',
            voterId: 'TN/01/001/1003',
            guardian: 'Rajesh Kumar Verma',
            gender: 'male',
            age: 21,
            rel: 'son',
            occ: 'Student',
            party: parties[2]._id,
          },
          {
            sl: '104',
            name: 'Pooja Verma',
            voterId: '',
            guardian: 'Rajesh Kumar Verma',
            gender: 'female',
            age: 17,
            rel: 'daughter',
            occ: 'Student',
            party: null,
          },
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
        religion: 'Hindu',
        boothNo: 'Booth 01',
        members: [
          {
            sl: '105',
            name: 'Anand Prakash Mehta',
            voterId: 'TN/01/001/1005',
            guardian: 'Sunder Lal Mehta',
            gender: 'male',
            age: 62,
            rel: 'head',
            occ: 'Retired Officer',
            party: parties[3]._id,
          },
          {
            sl: '106',
            name: 'Kavita Mehta',
            voterId: 'TN/01/001/1006',
            guardian: 'Anand Prakash Mehta',
            gender: 'female',
            age: 58,
            rel: 'spouse',
            occ: 'Homemaker',
            party: parties[3]._id,
          },
          {
            sl: '107',
            name: 'Rohit Mehta',
            voterId: 'TN/01/001/1007',
            guardian: 'Anand Prakash Mehta',
            gender: 'male',
            age: 32,
            rel: 'son',
            occ: 'Software Engineer',
            party: parties[4]._id,
          },
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
        religion: 'Muslim',
        boothNo: 'Booth 02',
        members: [
          {
            sl: '201',
            name: 'Farhan Ahmad Khan',
            voterId: 'TN/01/001/1008',
            guardian: 'Bashir Ahmad Khan',
            gender: 'male',
            age: 39,
            rel: 'head',
            occ: 'Retailer',
            party: parties[0]._id,
          },
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
        religion: 'Sikh',
        boothNo: 'Booth 02',
        members: [
          {
            sl: '202',
            name: 'Gurpreet Singh Gill',
            voterId: 'TN/01/001/1009',
            guardian: 'Darshan Singh Gill',
            gender: 'male',
            age: 50,
            rel: 'head',
            occ: 'Business',
            party: parties[1]._id,
          },
          {
            sl: '203',
            name: 'Jasleen Kaur Gill',
            voterId: 'TN/01/001/1010',
            guardian: 'Gurpreet Singh Gill',
            gender: 'female',
            age: 46,
            rel: 'spouse',
            occ: 'Lecturer',
            party: parties[1]._id,
          },
          {
            sl: '204',
            name: 'Simran Gill',
            voterId: 'TN/01/001/1011',
            guardian: 'Gurpreet Singh Gill',
            gender: 'female',
            age: 22,
            rel: 'daughter',
            occ: 'Medical Intern',
            party: null,
          },
        ],
      },
      {
        head: 'Joseph Fernandez',
        label: 'Grace Villa',
        house: '14-C',
        street: 'Church Road',
        locality: 'Civil Lines',
        phone: '9845012399',
        status: 'complete',
        religion: 'Christian',
        boothNo: 'Booth 02',
        members: [
          {
            sl: '205',
            name: 'Joseph Fernandez',
            voterId: 'TN/01/001/1012',
            guardian: 'Francis Fernandez',
            gender: 'male',
            age: 42,
            rel: 'head',
            occ: 'Architect',
            party: parties[0]._id,
          },
          {
            sl: '206',
            name: 'Mary Fernandez',
            voterId: 'TN/01/001/1013',
            guardian: 'Joseph Fernandez',
            gender: 'female',
            age: 38,
            rel: 'spouse',
            occ: 'Teacher',
            party: parties[3]._id,
          },
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
        boothNo: famData.boothNo || 'Booth 01',
        serialNo: m.sl,
        fullName: m.name,
        voterId: m.voterId,
        fatherOrHusbandName: m.guardian,
        doorNo: famData.house,
        gender: m.gender,
        age: m.age,
        religion: famData.religion,
        politicalParty: m.party,
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
        boothNo: 'Booth 01',
        serialNo: '101',
        fullName: 'Suresh Chandra Roy',
        voterId: 'TN/02/001/2001',
        fatherOrHusbandName: 'Bimal Chandra Roy',
        doorNo: '5',
        gender: 'male',
        age: 52,
        religion: 'Hindu',
        politicalParty: parties[1]._id,
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
        boothNo: 'Booth 01',
        serialNo: '102',
        fullName: 'Mousumi Roy',
        voterId: 'TN/02/001/2002',
        fatherOrHusbandName: 'Suresh Chandra Roy',
        doorNo: '5',
        gender: 'female',
        age: 47,
        religion: 'Hindu',
        politicalParty: parties[1]._id,
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
        boothNo: 'Booth 01',
        serialNo: '103',
        fullName: 'Debanjan Roy',
        voterId: 'TN/02/001/2003',
        fatherOrHusbandName: 'Suresh Chandra Roy',
        doorNo: '5',
        gender: 'male',
        age: 23,
        religion: 'Hindu',
        politicalParty: parties[0]._id,
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
      details: { message: 'Database initialized with political parties and voter rolls' },
      ipAddress: '127.0.0.1',
    });

    console.log('[Seed] Database successfully seeded with test political parties and voter records!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
