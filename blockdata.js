const express = require('express');
const bodyParser = require('body-parser');
// const mysql = require('mysql2');
const cors = require('cors');
// const { client } = require('websocket');

// Creating a MySQL connection pool
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'BlockDonate'
// });
const pg=require('pg');
const string='postgres://tqkdzist:DAh3RqV0M9uJ_X3ReT-k-PuXBKRj_vdF@mahmud.db.elephantsql.com/tqkdzist';
const pool = new pg.Client(string);
pool.connect();

const app = express();
app.use(cors());
// Use body-parser middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Start the server
app.listen(8001, () => {
  console.log('Server started on port 8001');
});

// Define API endpoints

// Get all fundraisers details
app.get('/allFundraisers', (req, res) => {
    pool.query('SELECT * FROM fundraisers', (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.json(results);
      }
    });
  });

  app.post('/registerFundraiser', (req, res) => {
    console.log('body is :', req.body);
    const address = req.body.address;
    const goalAmount = req.body.goalAmount;
    const fundDescription = req.body.fundDescription;
    const raisedBy = req.body.raisedBy;
  
    pool.query('SELECT * FROM "fundraisers" WHERE address = $1', [address], (error, results) => {
      console.log('results: ',results);
      if (error) {
        console.error('error1:',error);
        res.status(500).json({ error: error.sqlMessage });
      } else {
        // Check if a fundraiser already exists with the given address
        if (results.rows.length > 0) {
          // Update the existing fundraiser
          pool.query('UPDATE "fundraisers" SET "goalamount" = $1, "funddescription" = $2, "raisedby" = $3 WHERE "address" = $4', [goalAmount, fundDescription, raisedBy, address], (error, results) => {
            if (error) {
              console.error('error2:',error.message);
              res.status(500).json({ error: error.message });
            } else {
              res.send('Fundraiser updated successfully');
            }
          });
        } else {
          // Create a new fundraiser
          console.log(address, goalAmount, fundDescription, raisedBy);
          pool.query('INSERT INTO "fundraisers" ("address", "goalamount", "funddescription", "raisedby") VALUES ($1, $2, $3, $4)', [address, goalAmount, fundDescription, raisedBy], (error, results) => {
            if (error) {
              console.error('error3:',error.message);
              res.status(500).json({ error: error.message });
            } else {
              res.send('Fundraiser added successfully');
            }
          });
        }
      }
    });
  }); 


  app.post('/deleteFundraiser', (req, res) => {
    const address = req.body.address;
  
    // build SQL query
    const sql = 'DELETE FROM "fundraisers" WHERE address = $1';
  
    // execute SQL query
    pool.query(sql, [address], (error, results) => {
      if (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
      } else {
        res.send(`Fundraiser with address ${address} deleted successfully`);
      }
    });
  });
  

  app.get('/getFundraiser', (req, res) => {
    const address = req.query.address;
  
    // build SQL query
    const sql = 'SELECT * FROM fundraisers WHERE address = $1;';
  
    // execute SQL query
    pool.query(sql, [address], (error, results) => {
      if (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
      } else {
        if (results.rows.length === 0) {
          res.status(404).json({ error: `Fundraiser with address ${address} not found` });
        } else {
          res.json(results.rows[0]);
        }
      }
    });
  });
  

  app.get('/getDonor/:currentUser', (req, res) => {
    const address = req.params.currentUser;
    console.log('adress: ', address)
    // build SQL query
    const sql = 'SELECT * FROM certificates WHERE owner = $1;';
  
    // execute SQL query
    pool.query(sql, [address], (error, results) => {
      if (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
      } else {
        if (results.rows.length === 0) {
          res.status(404).json({ error: `Donor with address ${address} not found` });
        } else {
          res.json(results.rows);
        }
      }
    });
  }); 
  

app.post('/insertDonor', (req, res) => {
  const token = req.body.token;
  const owner = req.body.owner;
  const donatedTo = req.body.donatedTo;
  const amount = req.body.amount;
  const value = req.body.value;
  console.log(req.body);
        // Create a new fundraiser
        pool.query('INSERT INTO certificates (token,owner,donatedto,amount,value) VALUES ($1,$2,$3,$4,$5)', [token,owner,donatedTo,amount,value], (error, results) => {
          if (error) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
          } else {
            res.send('Certificates added successfully');
          }
        });
      }
);

app.post('/updateDonor', (req, res) => {
  const token = req.body.token;
  const owner = req.body.owner;
  console.log(req.body);
  pool.query('SELECT * FROM certificates WHERE token = $1', [token], (error, results) => {
    if (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    } else {
      // Check if a certificate already exists with the given token
      if (results.rows.length > 0) {
        // Update the existing certificate
        pool.query('UPDATE Certificates SET owner = $1 WHERE token = $2', [owner, token], (error, results) => {
          if (error) {
            console.error(error.message);
            res.status(500).json({ error: error.message });
          } else {
            res.send('Certificate updated successfully');
          }
        });
      } else {
        res.status(404).json({ error: `Certificate with token ${token} not found` });
      }
    }
  });
});