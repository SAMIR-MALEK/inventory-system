const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function safeCreate(model, data) {
  try {
    return await model.create({ data });
  } catch (error) {
    if (data.name) {
      return await model.findFirst({ where: { name: data.name } });
    }
    return null;
  }
}

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@univ-bba.dz' },
    update: {},
    create: {
      name: 'مدير النظام',
      email: 'admin@univ-bba.dz',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log('✅ تم إنشاء مستخدم المدير:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'أثاث' }, update: {}, create: { name: 'أثاث', description: 'طاولات وكراسي وخزائن' } }),
    prisma.category.upsert({ where: { name: 'أجهزة إلكترونية' }, update: {}, create: { name: 'أجهزة إلكترونية', description: 'حواسيب وطابعات وشاشات' } }),
    prisma.category.upsert({ where: { name: 'مستلزمات مكتبية' }, update: {}, create: { name: 'مستلزمات مكتبية', description: 'أقلام وورق وأدوات' } }),
    prisma.category.upsert({ where: { name: 'أجهزة تعليمية' }, update: {}, create: { name: 'أجهزة تعليمية', description: 'بروجكتورات وسبورات ذكية' } }),
    prisma.category.upsert({ where: { name: 'معدات أمن' }, update: {}, create: { name: 'معدات أمن', description: 'كاميرات وأجهزة مراقبة' } }),
  ]);
  console.log('✅ تم إنشاء الفئات');

  // Create locations safely
  const locationsData = [
    { name: 'المخزن الرئيسي', type: 'STORAGE', description: 'المخزن العام للكلية' },
    { name: 'مكتب العميد', type: 'OFFICE' },
    { name: 'مكتب نائب العميد', type: 'OFFICE' },
    { name: 'الأمانة العامة', type: 'OFFICE' },
    { name: 'قاعة المحاضرات 1', type: 'HALL' },
    { name: 'قاعة المحاضرات 2', type: 'HALL' },
    { name: 'المكتبة', type: 'OFFICE' },
    { name: 'قاعة الحاسوب', type: 'HALL' },
  ];

  const locations = [];
  for (const loc of locationsData) {
    const created = await safeCreate(prisma.location, loc);
    if (created) locations.push(created);
  }
  console.log('✅ تم إنشاء المواقع');

  // Create sample items safely
  const items = [
    { name: 'حاسوب مكتبي HP', quantity: 15, categoryId: categories[1].id, locationId: locations[0].id, unit: 'جهاز', condition: 'GOOD' },
    { name: 'طاولة مكتب', quantity: 8, categoryId: categories[0].id, locationId: locations[0].id, unit: 'قطعة', condition: 'GOOD' },
    { name: 'كرسي مكتب', quantity: 20, categoryId: categories[0].id, locationId: locations[0].id, unit: 'قطعة', condition: 'GOOD' },
    { name: 'طابعة Epson', quantity: 3, categoryId: categories[1].id, locationId: locations[3].id, unit: 'جهاز', condition: 'GOOD' },
    { name: 'بروجكتور Epson', quantity: 5, categoryId: categories[3].id, locationId: locations[0].id, unit: 'جهاز', condition: 'GOOD' },
    { name: 'ورق A4 (رزمة)', quantity: 50, categoryId: categories[2].id, locationId: locations[0].id, unit: 'رزمة', condition: 'GOOD', minQuantity: 10 },
    { name: 'لوح ذكي', quantity: 2, categoryId: categories[3].id, locationId: locations[0].id, unit: 'جهاز', condition: 'GOOD' },
    { name: 'كاميرا مراقبة', quantity: 8, categoryId: categories[4].id, locationId: locations[0].id, unit: 'جهاز', condition: 'GOOD' },
  ];

  for (const item of items) {
    await safeCreate(prisma.item, item);
  }
  console.log('✅ تم إنشاء الوسائل الأولية');

  console.log('\n🎉 تمت تهيئة قاعدة البيانات بنجاح!');
  console.log('📧 البريد الإلكتروني للمدير: admin@univ-bba.dz');
  console.log('🔑 كلمة المرور: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
