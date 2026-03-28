const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' }
  });
  res.json({ success: true, data: categories });
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({ data: { name, description } });
    res.status(201).json({ success: true, data: category, message: 'تمت إضافة الفئة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إضافة الفئة' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: category, message: 'تم تحديث الفئة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث الفئة' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'تم حذف الفئة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف الفئة' });
  }
});

module.exports = router;
