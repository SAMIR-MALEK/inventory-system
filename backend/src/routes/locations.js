const express = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: locations });
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const location = await prisma.location.create({ data: { name, type, description } });
    res.status(201).json({ success: true, data: location, message: 'تمت إضافة الموقع بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إضافة الموقع' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const location = await prisma.location.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: location, message: 'تم تحديث الموقع بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث الموقع' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'تم حذف الموقع بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف الموقع' });
  }
});

module.exports = router;
