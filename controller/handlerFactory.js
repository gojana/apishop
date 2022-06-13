const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

exports.getAllDocs = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.find({ active: 1 });

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getDocById = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.id);

    if (!doc) {
      return next(
        new appError(
          `no se encontro el documento con el ID: ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.addDoc = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.create(req.body);
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

exports.updateDoc = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!doc) {
      return next(
        new appError(
          `no se encontro el documento con el ID: ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ status: 'success', data: doc, runvalidator: true });
  });

exports.deleteDoc = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new appError(
          `no se encontro el documento con el ID: ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({ status: 'success', data: 'null' });
  });
