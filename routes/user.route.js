let express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  router = express.Router();

// Multer File upload settings
const DIR = './public/';
const path = require('path');
const {spawn} = require('child_process');
var fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

var upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5
  // },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf" || 
    file.mimetype == "application/msword" || 
    file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessing" || 
    file.mimetype == "application/doc" || 
    file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    file.mimetype == "application/ms-doc") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only image, word and pdf format allowed!'));
    }
  }
});

// User model
let User = require('../models/User');

router.post('/create-user', upload.array('avatar', 6), (req, res, next) => {
  const reqFiles = []
  const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
    reqFiles.push(url + '/public/' + req.files[i].filename)

    var ncp = require('ncp');
 
    ncp.limit = 16;
    
    ncp('./public', './resumes', function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('done!');
    });

    ncp('./public', './temp', function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('done!');
    });

    function runScript(){
      return spawn('python3', [
        "-u", 
        path.join(__dirname, '../extract_resume_info.py'),
      ]);
    }
  
    const subprocess = runScript()
    // print output of script
    subprocess.stdout.on('data', (data) => {
      console.log(`data:${data}`);
    });
    subprocess.stderr.on('data', (data) => {
      console.log(`error:${data}`);
    });
    subprocess.on('close', () => {
      console.log("Closed");
    });
  //run pymongo

  //end of pymongo
    console.log(req.files[i].filename)
    var file_path = reqFiles[i]
    var uploaded_file_name = req.files[i].filename
    setTimeout(() => {  
      
      let rawdata = fs.readFileSync(path.join(__dirname, '../resumes/'+uploaded_file_name+'.json'));
      let applicant = JSON.parse(rawdata);
      console.log(applicant['name']);
    
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        avatar: file_path,
        name: applicant['name'],
        email: applicant['email'],
        mobile_number: applicant['mobile_number'],
        skills: applicant['skills'],
        college_name: applicant['college_name'],
        degree: applicant['degree'],
        designation: applicant['designation'],
        experience: applicant['experience'],
        company_names: applicant['company_names'],
        total_experience: applicant['total_experience'],
      });
      user.save().then(result => {
        console.log(result);
        res.status(201).json({
          message: "Done upload!",
          userCreated: {
            _id: result._id,
            avatar: result.avatar,
            name: result.name,
            email: result.email,
            mobile_number: result.mobile_number,
            skills: result.skills,
            college_name: result.college_name,
            degree: result.degree,
            designation: result.designation,
            experience: result.experience,
            company_names: result.company_names,
            total_experience: result.total_experience,
    
          }
        })
      }).catch(err => {
        console.log(err),
          res.status(500).json({
            error: err
          });
      }); }, 2000, uploaded_file_name, file_path);
  
  
    
  }

  router.get("/", (req, res, next) => {
    User.find().then(data => {
      res.status(200).json({
        message: "User list retrieved successfully!",
        users: data
      });
    });
  });
  
  fs.readdir('./resumes', (err, files) => {
    if (err) {
        console.log(err);
    }
  
    files.forEach(file => {
        const fileDir = path.join('./resumes', file);
  
        if (!file.endsWith(".json")) {
            fs.unlinkSync(fileDir);
        }
    });
  });


  // -------
  // const pyFile = 'script.py';
  // const args = reqFiles;
  // args.unshift(pyFile);
  // const pyspawn = spawn('python3', args);
  // you can access it using file.path
  
})

module.exports = router;



