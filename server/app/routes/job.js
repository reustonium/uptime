let Job = require('../model/job');
let pingWorker = require('../ping-worker');

// ******************************
// GET /job route to get all jobs
// ******************************
function getJobs(req, res) {
  let query = Job.find({});
  query.exec((err, jobs) => {
    if (err) res.send(err);
    res.json(jobs)
  });
}

// ***************************
// POST /job to save a new job
// ***************************
function postJob(req, res) {
  let newJob = new Job(req.body);
  newJob.uptimes = {
    day: 100,
    week: 100,
    month: 100
  }
  newJob.status = 'created';
  newJob.save((err, job) => {
    if (err) {
      res.send(err);
    } else {
      pingWorker.createJob(newJob);
      res.json({
        message: "Job successfully added",
        job
      });
    }
  });
}

// ***********************************
// GET /job/:id route to get job by id
// ***********************************
function getJob(req, res) {
  Job.findById({
    _id: req.params.id
  })
    .lean()
    .exec((err, job) => {
      if (err) {
        res.send(err);
      } else {
        res.json(job);
      }
    });
}

// *****************************************
// DELETE /job/:id route to remove job by id
// *****************************************
function deleteJob(req, res) {
  Job.remove({
    _id: req.params.id
  }, (err, result) => {
    if (err) res.send(err)

    pingWorker.cancelJob(req.params.id);
    res.send({
      message: 'successfully removed job',
      result
    });
  });
}

module.exports = {
  getJobs,
  postJob,
  getJob,
  deleteJob
};
