const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const itemSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(0).default(1),
  unit: z.string().default('قطعة'),
  condition: z.enum(['GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('GOOD'),
  categoryId: z.string(),
  locationId: z.string(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional()
});

// GET /api/items
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, categoryId, locationId, condition } = req.query;
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    if (locationId) where.locationId = locationId;
    if (condition) where.condition = condition;

    const items = await prisma.item.findMany({
      where,
      include: { category: true, location: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

// GET /api/items/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        location: true,
        transactions: { include: { user: true }, orderBy: { date: 'desc' }, take: 10 }
      }
    });
    if (!item) return res.status(404).json({ success: false, message: 'الوسيلة غير موجودة' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

// POST /api/items
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = itemSchema.parse(req.body);
    const item = await prisma.item.create({
      data: { ...data, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null },
      include: { category: true, location: true }
    });
    res.status(201).json({ success: true, data: item, message: 'تمت إضافة الوسيلة بنجاح' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'خطأ في إضافة الوسيلة' });
  }
});

// PUT /api/items/:id
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = itemSchema.partial().parse(req.body);
    const item = await prisma.item.update({
      where: { id: req.params.id },
      data: { ...data, purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined },
      include: { category: true, location: true }
    });
    res.json({ success: true, data: item, message: 'تم تحديث الوسيلة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث الوسيلة' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.item.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'تم حذف الوسيلة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف الوسيلة' });
  }
});

module.exports = router;
