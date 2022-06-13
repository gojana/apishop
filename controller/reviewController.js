const Reviews = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controller/handlerFactory');


//-----------------PUBLIC API--------------------
//obtiene todas las reviews de x producto
exports.getAllReviews = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.prodId) filter = { ProdFK: req.params.prodId };
  const doc = await Reviews.find(filter);
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      doc,
    },
  });
});

//---------------USER API---------------------------------

exports.getMyReviews = catchAsync(async (req, res) => {
  const myReviews = await Reviews.find({
    userFK: req.user.id,
    active: 1,
  });
  res.status(200).json({ status: 'success', data: { reviews: myReviews } });
});
exports.addReview = catchAsync(async (req, res, next) => {
  const newReview = await Reviews.create({
    score: req.body.score,
    comment: req.body.comment,
    userFK: req.user.id,
    ProdFK: req.params.prodId,
    active: 1,
  });
  res.status(200).json({ status: 'success', data: { review: newReview } });
});
exports.updateMyReview = catchAsync(async (req, res) => {
  const updatedReview = await Reviews.findOneAndUpdate(
    {
      userFK: req.user.id,
      ProdFK: req.params.prodId,
      active: 1,
    },
    { score: req.body.score, comment: req.body.comment },
    { new: true, runValidators: true }
  );
  res.status(200).json({ status: 'success', data: { review: updatedReview } });
});
exports.deleteMyReviews = catchAsync(async (req, res) => {
  await Reviews.findOneAndDelete(
    { userFK: req.user.id, ProdFK: req.params.prodId } );
  res.status(204).json({ status: 'success', data: null });
});
//---------------ADMIN API-----------------------------------
exports.getReviewById = factory.getDocById(Reviews);
exports.deleteReview = factory.deleteDoc(Reviews);