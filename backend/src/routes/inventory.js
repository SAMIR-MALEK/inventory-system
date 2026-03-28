const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  const inventories = await prisma.inventory.findMany({
    include: { location: true, user: { select: { name: true } }, _count: { select: { items: true } } },
    orderBy: { date: 'desc' }
  });
  res.json({ success: true, data: inventories });
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { locationId, notes, items } = req.body;
    const inventory = await prisma.inventory.create({
      data: {
        locationId,
        notes,
        userId: req.user.id,
        items: { create: items }
      },
      include: { location: true, items: { include: { item: true } } }
    });
    res.status(201).json({ success: true, data: inventory, message: 'تم إنشاء الجرد بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الجرد' });
  }
});

router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    const inventory = await prisma.inventory.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' }
    });
    res.json({ success: true, data: inventory, message: 'تم إتمام الجرد بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إتمام الجرد' });
  }
});

module.exports = router;
