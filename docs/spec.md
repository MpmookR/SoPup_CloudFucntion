# SoPup Data Model Specification

## User
- `id`: string (unique identifier)
- `name`: string
- `gender`: enum (see UserGenderOption)
- `imageURL`: string (profile image)
- `location`: string (city, address, etc.)
- `coordinate`: object (latitude & longitude)
- `locationPermissionDenied`: boolean
- `bio`: string (optional)
- `language`: string (e.g., "en", "th")
- `primaryDogId`: string (references Dog)
- `isMock`: boolean (optional)

## Dog

- `id`: string (unique identifier)
- `name`: string
- `gender`: enum (see DogGenderOption)
- `size`: enum (e.g., "small", "medium", "large")
- `weight`: number (kg)
- `breed`: string
- `dob`: date of birth (datetime)
- `mode`: enum (e.g., "puppy", "social")
- `status`: string (e.g., "active", "inactive")
- `imageURLs`: array of strings (profile images)
- `bio`: string (optional)
- `profileStatus`: enum ("Ready", "Not yet")
- `isMock`: boolean (optional)

### Specializations

#### PuppyProfile (extends DogProfile)
- `coreVaccination1`: boolean
- `coreVaccination2`: boolean

#### SocialDogProfile (extends DogProfile)
- `isNeutered`: boolean
- `behavior`: string (optional)
- `healthStatus`: enum ("verified", "unverify")

## MatchRequest
- `id`: string (unique identifier)
- `fromUserId`: string (references User)
- `userAId`: string (references User)
- `userBId`: string (references User)
- `createdAt`: datetime
- `status`: enum ("pending", "accepted", "rejected")

## ChatMessage

Chat messages are exchanged between users only when the related `MatchRequest` has a status of `"accepted"`.

- `id`: string (unique identifier)
- `matchId`: string (references MatchRequest with status "accepted")
- `senderId`: string (references User)
- `recipientId`: string (references User)
- `message`: string
- `createdAt`: datetime

> **Note:**  
> - Both `senderId` and `recipientId` are included to clearly identify the participants in each message.

## Meetup

Meetups can only be created when both users are in "social" mode status. Otherwise, a warning message will be shown.

- `id`: string (unique identifier)
- `matchId`: string (references MatchRequest)
- `scheduledAt`: datetime (date and time of the meetup)
- `location`: object (uses Swift framework location type; includes latitude, longitude, and address)
- `status`: enum ("pending", "accepted", "cancelled", "met")
- `createdBy`: string (references User)
- `createdAt`: datetime
- `updatedAt`: datetime

> **Note:**  
> - Meetups require both users to be in "social" mode.  
> - Status can be "pending", "accepted", "cancelled", or "met".

