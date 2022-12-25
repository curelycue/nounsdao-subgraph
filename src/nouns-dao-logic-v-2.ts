import { BigInt } from "@graphprotocol/graph-ts"
import { Vote, Voter } from "../generated/schema"
import {
  VoteCast
} from "../generated/NounsDAOLogicV2/NounsDAOLogicV2"


export function handleNewVote(event: VoteCast): void {

  let voter = Voter.load(event.params.voter.toHex())


  if (voter == null) {

    // create if doesn't exist yet

    voter = new Voter(event.transaction.from.toHex())


    voter.totalVotesCount = 0

  }


  let vote = new Vote(

    event.transaction.hash.toHex() + "-" + event.logIndex.toString()

  )

  vote.voter = voter.id



  vote.save()


  voter.totalVotesCount++




  // update array like this



  voter.save()

}



  