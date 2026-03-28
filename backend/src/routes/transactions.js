const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const txSchema = z.object({
  type: z.enum(['PURCHASE', 'DISTRIBUTE', 'TRANSFER', 'RETURN', 'DISPOSAL']),
  quantity: z.number().int().positive('الكمية يجب أن تكون أكبر من صفر'),
  itemId: z.string(),
  notes: z.string().optional(),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional()
});

// GET /api/transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, itemId, limit = 50 } = req.query;
    const where = {};
    if (type) where.type = type;
    if (itemId) where.itemId = itemId;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        item: true,
        user: { select: { id: true, name: true } },
        fromLocation: true,
        toLocation: true
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit)
    });
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب العمليات' });
  }
});

// POST /api/transactions
router.post('/', authenticate, async (req, res) => {
  try {
    const data = txSchema.parse(req.body);
    const item = await prisma.item.findUnique({ where: { id: data.itemId } });
    if (!item) return res.status(404).json({ success: false, message: 'الوسيلة غير موجودة' });

    // Update quantity based on transaction type
    let quantityChange = 0;
    if (data.type === 'PURCHASE' || data.type === 'RETURN') quantityChange = data.quantity;
    if (data.type === 'DISTRIBUTE' || data.type === 'DISPOSAL') quantityChange = -data.quantity;

    if (quantityChange < 0 && item.quantity + quantityChange < 0) {
      return res.status(400).json({ success: false, message: 'الكمية المطلوبة أكبر من المتوفر' });
    }

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: { ...data, userId: req.user.id },
        include: { item: true, user: { select: { id: true, name: true } }, fromLocation: true, toLocation: true }
      }),
      prisma.item.update({
        where: { id: data.itemId },
        data: { quantity: { increment: quantityChange } }
      })
    ]);

    res.status(201).json({ success: true, data: transaction, message: 'تمت العملية بنجاح' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'خطأ في تنفيذ العملية' });
  }
});

module.exports = router;
