import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create users
    const adminPassword = await bcrypt.hash('admin12345', 12);
    const memberPassword = await bcrypt.hash('student12345', 12);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });

    const member = await prisma.user.upsert({
        where: { username: 'student1' },
        update: {},
        create: {
            username: 'student1',
            passwordHash: memberPassword,
            role: 'MEMBER',
        },
    });

    console.log('✅ Users created:', admin.username, member.username);

    // Create events
    const event1 = await prisma.event.create({
        data: {
            titleUz: "Huquqiy debat musobaqasi",
            titleEn: "Legal Debate Competition",
            descriptionUz: "Talabalar uchun huquqiy debat musobaqasi. Ishtirokchilar huquqiy masalalar bo'yicha bahslashadilar.",
            descriptionEn: "Legal debate competition for students. Participants will argue on legal issues.",
            date: new Date('2026-02-15'),
            time: "10:00",
            locationUz: "Milliy Universitet, 3-bino, 201-xona",
            locationEn: "National University, Building 3, Room 201",
            status: 'UPCOMING',
            createdById: admin.id,
        },
    });

    const event2 = await prisma.event.create({
        data: {
            titleUz: "Konstitutsiya haqida seminar",
            titleEn: "Constitution Seminar",
            descriptionUz: "O'zbekiston Konstitutsiyasining asosiy tamoyillari haqida seminar.",
            descriptionEn: "Seminar on the basic principles of the Constitution of Uzbekistan.",
            date: new Date('2026-03-01'),
            time: "14:00",
            locationUz: "Adliya vazirligi, konferens-zal",
            locationEn: "Ministry of Justice, Conference Hall",
            status: 'UPCOMING',
            createdById: admin.id,
        },
    });

    const event3 = await prisma.event.create({
        data: {
            titleUz: "Huquqiy klinika ochilish marosimi",
            titleEn: "Legal Clinic Opening Ceremony",
            descriptionUz: "Yangi huquqiy klinikaning ochilish marosimi bo'lib o'tdi.",
            descriptionEn: "The opening ceremony of the new legal clinic was held.",
            date: new Date('2025-12-01'),
            time: "11:00",
            locationUz: "Huquqshunoslik fakulteti",
            locationEn: "Faculty of Law",
            status: 'PAST',
            createdById: admin.id,
        },
    });

    console.log('✅ Events created:', event1.titleEn, event2.titleEn, event3.titleEn);

    // Create reports
    await prisma.report.create({
        data: {
            titleUz: "2025-yil hisoboti",
            titleEn: "2025 Annual Report",
            bodyUz: "Qomus platformasining 2025-yildagi faoliyati haqida batafsil hisobot. O'tgan yil davomida 50+ tadbir o'tkazildi va 1000+ talaba ishtirok etdi.",
            bodyEn: "Detailed report on Qomus platform activities in 2025. Over 50 events were held and 1000+ students participated throughout the year.",
            coverImageUrl: null,
        },
    });

    await prisma.report.create({
        data: {
            titleUz: "Huquqiy klinika faoliyati",
            titleEn: "Legal Clinic Activities",
            bodyUz: "Huquqiy klinikamiz orqali ko'rsatilgan bepul yuridik yordam xizmatlari haqida hisobot.",
            bodyEn: "Report on free legal aid services provided through our legal clinic.",
            coverImageUrl: null,
        },
    });

    console.log('✅ Reports created');

    // Create resources (tags as JSON string for SQLite)
    await prisma.resource.create({
        data: {
            titleUz: "Huquqiy atamalar lug'ati",
            titleEn: "Legal Terms Dictionary",
            descriptionUz: "Eng ko'p ishlatiladigan huquqiy atamalar va ularning ta'riflari.",
            descriptionEn: "Most commonly used legal terms and their definitions.",
            fileUrl: "/uploads/legal-dictionary.pdf",
            fileType: 'PDF',
            tags: JSON.stringify(['dictionary', 'terminology', 'reference']),
        },
    });

    await prisma.resource.create({
        data: {
            titleUz: "Fuqarolik kodeksi",
            titleEn: "Civil Code",
            descriptionUz: "O'zbekiston Respublikasi Fuqarolik kodeksining to'liq matni.",
            descriptionEn: "Full text of the Civil Code of the Republic of Uzbekistan.",
            fileUrl: "/uploads/civil-code.pdf",
            fileType: 'PDF',
            tags: JSON.stringify(['law', 'civil', 'code']),
        },
    });

    await prisma.resource.create({
        data: {
            titleUz: "Shartnoma namunasi",
            titleEn: "Contract Template",
            descriptionUz: "Xizmat ko'rsatish shartnomasi namunasi.",
            descriptionEn: "Service agreement contract template.",
            fileUrl: "/uploads/contract-template.docx",
            fileType: 'DOCX',
            tags: JSON.stringify(['template', 'contract', 'service']),
        },
    });

    console.log('✅ Resources created');

    // Create videos
    await prisma.video.create({
        data: {
            titleUz: "Huquqlaringizni bilasizmi?",
            titleEn: "Do You Know Your Rights?",
            descriptionUz: "Har bir fuqaro bilishi kerak bo'lgan asosiy huquqlar haqida qisqa video.",
            descriptionEn: "Short video about basic rights every citizen should know.",
            videoUrl: "/uploads/rights-video.mp4",
            durationSeconds: 120,
            thumbnailUrl: null,
        },
    });

    await prisma.video.create({
        data: {
            titleUz: "Mehnat huquqi asoslari",
            titleEn: "Labor Law Basics",
            descriptionUz: "Ish beruvi va xodim o'rtasidagi munosabatlarni tartibga soluvchi qonunlar haqida.",
            descriptionEn: "About laws regulating relations between employer and employee.",
            videoUrl: "/uploads/labor-law.mp4",
            durationSeconds: 180,
            thumbnailUrl: null,
        },
    });

    await prisma.video.create({
        data: {
            titleUz: "Iste'molchi huquqlari",
            titleEn: "Consumer Rights",
            descriptionUz: "Xarid qilishda va xizmatlardan foydalanishda iste'molchi huquqlari.",
            descriptionEn: "Consumer rights when purchasing goods and using services.",
            videoUrl: "/uploads/consumer-rights.mp4",
            durationSeconds: 90,
            thumbnailUrl: null,
        },
    });

    console.log('✅ Videos created');

    // Create partners
    await prisma.partner.create({
        data: {
            name: "O'zbekiston Milliy Universiteti",
            descriptionUz: "Mamlakatimizdagi eng yirik oliy ta'lim muassasasi.",
            descriptionEn: "The largest higher education institution in our country.",
            logoUrl: null,
            linkUrl: "https://nuu.uz",
        },
    });

    await prisma.partner.create({
        data: {
            name: "Adliya Vazirligi",
            descriptionUz: "O'zbekiston Respublikasi Adliya vazirligi bilan hamkorlik.",
            descriptionEn: "Partnership with the Ministry of Justice of Uzbekistan.",
            logoUrl: null,
            linkUrl: "https://minjust.uz",
        },
    });

    console.log('✅ Partners created');

    // Create sample registration
    await prisma.teamRegistration.create({
        data: {
            eventId: event1.id,
            teamName: "Huquqchilar jamoasi",
            membersCount: 4,
            leaderUserId: member.id,
            ratingStatus: 'GREEN',
            notes: "Excellent team!",
        },
    });

    console.log('✅ Sample registration created');

    console.log('🎉 Seeding completed!');
    console.log('\n📝 Demo accounts:');
    console.log('   Admin: admin / admin12345');
    console.log('   Member: student1 / student12345');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
