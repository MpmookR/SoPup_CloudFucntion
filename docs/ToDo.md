## ✍️ To Do:
Feature:
# chat
# meet up schedual 
# dog review: client ? backend



## ✅ Done:
## auth.ts
Replace with real Firebase token validation before production

## Update location
On client side, when user updates their location, we need to update the location in the database.

We also need to calculate geohash for the location to be able to use geoqueries. 
Docs: https://firebase.google.com/docs/firestore/solutions/geoqueries

We also need to copy localtion and geohash to all the dogs user has.

All updates should be done in transaction. Docs: https://firebase.google.com/docs/firestore/manage-data/transactions

## Client side - create struct and DTO for matchMaking
Build the struct and request payload to support the score, sort and filter matchMarking logic