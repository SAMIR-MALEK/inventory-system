const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const [totalItems, totalLocations, totalCategories, recentTransactions, lowStockItems, itemsByCategory] =
      await Promise.all([
        prisma.item.aggregate({ _sum: { quantity: true }, _count: true }),
        prisma.location.count(),
        prisma.category.count(),
        prisma.transaction.findMany({
          take: 10,
          orderBy: { date: 'desc' },
          include: { item: true, user: { select: { name: true } } }
        }),
        prisma.item.findMany({
          where: { quantity: { lte: prisma.item.fields.minQuantity } },
          include: { location: true, category: true },
          take: 5
        }),
        prisma.category.findMany({
          include: { _count: { select: { items: true } }, items: { select: { quantity: true } } }
        })
      ]);

    const categoryStats = itemsByCategory.map(cat => ({
      name: cat.name,
      count: cat._count.items,
      totalQty: cat.items.reduce((sum, i) => sum + i.quantity, 0)
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalItems: totalItems._count,
          totalQuantity: totalItems._sum.quantity || 0,
          totalLocations,
          totalCategories
        },
        recentTransactions,
        lowStockItems,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات لوحة التحكم' });
  }
});

module.exports = router;
