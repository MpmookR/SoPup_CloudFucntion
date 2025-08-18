## ✍️ To Do:

1. recreate the fetch meet up request based on meetupRequest type: incoming and outgoing
example from the getMatchRequests function (no accept)

2. after reciver accept the meet up request using the updateMeetupStatus
 - we should be able to fetch the accepted meet up to show it on client side

3. make sure the cancelMeetupRequest, the current status of the meet up should be accepted. 
- then allow both users to cancel it

4. A function to check if accepted meetup has passed the ended meet up time for an hour. 
- We should have a function to auto-change the status from accepted to completed 

- this will allow another controller to check the completed meet up status and allow user to leave the review



// eslint-disable-next-line new-cap


✅ modeSwitcher: COMPLETED

condition

1. user is on the puppy mode
2. they must provide both
   coreVaccination1Date?: Date
   coreVaccination2Date?: Date
3. if the coreVaccination is completed, trigger modeSwitcher and change user to social mode : export enum DogMode {
   Puppy = "puppy",
   Social = "social",
   }
4. if only 1 vaccine is added. stay as it is

Swift side:

1. user input core vaccination
2. user tap save
   - save the one or two vaccinations to firestore
   - trigger modeSwicher function

Backend mode switcher function

1. fetch user data ✅
2. check vaccination conditions ✅
3. return readiness status (no auto-switch) ✅
4. frontend shows alert if ready to switch ✅
5. user taps button to manually switch mode ✅
6. prompt user to complete behavior profile ✅

## ✅ New API Endpoints Added:

### Vaccination Management:

- `PUT /dogs/:dogId/vaccinations` - Update vaccination dates
- `POST /dogs/:dogId/mode-switch` - Switch dog mode (puppy ↔ social)

### Behavior Management:

- `PUT /dogs/:dogId/behavior` - Update behavior profile (social mode only)
  - `isNeutered: boolean`
  - `behavior: DogBehavior` (play style, environment, triggers)
  - `healthStatus: HealthStatus` (flea/worming treatment dates)

## 🔄 Complete Flow:

1. User adds vaccinations → Backend saves them
2. Frontend checks vaccination status → Shows "Switch to Social?" alert
3. User switches mode → Backend validates & switches
4. Frontend prompts behavior setup → User completes profile
5. User can now participate in social matching

To do

Review 
>> Rating: 1 - 5 
>> comment

To be able to post review: 
1. the meetup should change its status to completed
2. The reviewer hasn't already submitted a review for this meetup. 
3. The user cant review themselves 
4. review must be able to get the average score per user

in review section for user A, should show:
- avg rating for the  user A

review card: 
- userB's dog name 
- date review
- rating that give to userA
- UserB's comment

