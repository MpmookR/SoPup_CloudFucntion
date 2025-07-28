import { Coordinate } from "../Coordinate";
import { Dog } from "../Dog";
import { DogFilterSettings } from "./DogFilterSettings";

// this DTO is used to send data for scoring matches between frontend and backend
// It is used in the match scoring algorithm to determine the best matches for the current dog based on the filters set by the user

export interface MatchScoringDTO {
  currentDogId: Dog;
  filteredDogIds: string[];
  userLocation: Coordinate;
  filters?: DogFilterSettings; 
}
  

