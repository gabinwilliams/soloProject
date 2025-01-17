const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const encryptLib = require("../modules/encryption");
const userStrategy = require("../strategies/user.strategy");

// GET profiles
router.get("/", rejectUnauthenticated, (req, res) => {
  const query = ` WITH unchosen as ( -- Create the variable and name it
    SELECT u.* -- Return every column from "user", aliased as u
    FROM "user" as u -- Add "user" table, alias as u
    JOIN "user_likes" as liked ON liked.liked_user_id = u.id -- JOIN "user_likes" aliased as liked
    WHERE liked.liked = false AND liked.user_id = $1 
    -- filter by liked=false, not authenticated user.
    GROUP BY u.id -- returns distinct user ids.
)

-- Select all columns from user;
SELECT u.*
-- Add user table, give alias of u since user is a reserved word in Postgres
FROM "user" as u
-- Ensure each user in the unchosen query above is returned
WHERE u.id IN (SELECT id FROM unchosen) OR 
    -- FILTER OUT users in the next query
    u.id NOT IN (
        -- Select everyone that has a "liked"=true and "liked" by the authenticated user
        SELECT "user_likes".liked_user_id
        from "user_likes"
        WHERE "user_likes".liked = true AND "user_likes".user_id = $1
        -- Group by liked_user_id to remove duplicate entries
        -- WHY? Saves time returning, because this is a small list
        -- It's easier to GROUP/SORT/COUNT/WHATEVER a small group
        -- Than do the same action on a very large table
        --GROUP BY "user_likes".liked_user_id
    );
  `;

  pool
    .query(query, [req.user.id])
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("ERROR: Getting all profiles", err);
      res.sendStatus(500);
    });
});

// GET Profile Likes
router.get("/likes", rejectUnauthenticated, (req, res) => {
  const query = `SELECT "user".name, "user".id AS user_id, "user".active, "user".bio, "user".dev_type, "user".github, "user".profile_image, "user".tech_one, "user".tech_two, "user".tech_three, "user".username, "user_likes".liked, "user_likes".liked_user_id, "user_likes".match
  FROM "user_likes"
  JOIN "user" ON "user".id = "user_likes".user_id
  ORDER BY "match" DESC
  ;`;

  pool
    .query(query)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("ERROR: Getting profile likes", err);
      res.sendStatus(500);
    });
});

// Update profile matches
router.put("/match", rejectUnauthenticated, (req, res) => {
  const queryText = `UPDATE "user_likes" 
    SET "match" = $1
    WHERE "user_id" = ${req.body.user_id} AND "liked_user_id" = ${req.body.liked_user_id} OR "user_id" = ${req.body.liked_user_id} AND "liked_user_id" = ${req.body.user_id}
    ;`;
  pool
    .query(queryText, [req.body.match])
    .then(() => res.sendStatus(201))
    .catch((err) => {
      console.log("error in PUT /match ", err);
      res.sendStatus(500);
    });
});
// Remove requested like from connection page
router.delete("/connection/request/:id", rejectUnauthenticated, (req, res) => {
  console.log("In DELETE /connection/request", req.params);
  const queryText = `
  DELETE FROM "user_likes" 
  WHERE "user_likes".user_id = ${req.params.id}
  `;
  pool
    .query(queryText)
    .then(() => res.sendStatus(201))
    .catch((err) => {
      console.log("error in DELETE /connection/request ", err);
      res.sendStatus(500);
    });
});

module.exports = router;
