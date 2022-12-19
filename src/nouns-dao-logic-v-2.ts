import { BigInt } from "@graphprotocol/graph-ts"
import {
  NounsDAOLogicV2,
  NewAdmin,
  NewImplementation,
  NewPendingAdmin,
  NewVetoer,
  ProposalCanceled,
  ProposalCreated,
  ProposalCreatedWithRequirements,
  ProposalExecuted,
  ProposalQueued,
  ProposalThresholdBPSSet,
  ProposalVetoed,
  QuorumVotesBPSSet,
  VoteCast,
  VotingDelaySet,
  VotingPeriodSet
} from "../generated/NounsDAOLogicV2/NounsDAOLogicV2"
import { ExampleEntity } from "../generated/schema"

export function handleNewAdmin(event: NewAdmin): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.oldAdmin = event.params.oldAdmin
  entity.newAdmin = event.params.newAdmin

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.admin(...)
  // - contract.implementation(...)
  // - contract.pendingAdmin(...)
}

export function handleNewImplementation(event: NewImplementation): void {}

export function handleNewPendingAdmin(event: NewPendingAdmin): void {}

export function handleNewVetoer(event: NewVetoer): void {}

export function handleProposalCanceled(event: ProposalCanceled): void {}

export function handleProposalCreated(event: ProposalCreated): void {}

export function handleProposalCreatedWithRequirements(
  event: ProposalCreatedWithRequirements
): void {}

export function handleProposalExecuted(event: ProposalExecuted): void {}

export function handleProposalQueued(event: ProposalQueued): void {}

export function handleProposalThresholdBPSSet(
  event: ProposalThresholdBPSSet
): void {}

export function handleProposalVetoed(event: ProposalVetoed): void {}

export function handleQuorumVotesBPSSet(event: QuorumVotesBPSSet): void {}

export function handleVoteCast(event: VoteCast): void {}

export function handleVotingDelaySet(event: VotingDelaySet): void {}

export function handleVotingPeriodSet(event: VotingPeriodSet): void {}

export function getOrCreateVote(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = false,
): Vote {
  let vote = Vote.load(id);

  if (vote == null && createIfNotFound) {
    vote = new Vote(id);

    if (save) {
      vote.save();
    }
  }

  return vote as Vote;
}

export function handleVoteCast(event: VoteCast): void {
  let proposal = getOrCreateProposal(event.params.proposalId.toString());
  let voteId = event.params.voter
    .toHexString()
    .concat('-')
    .concat(event.params.proposalId.toString());
  let vote = getOrCreateVote(voteId);
  let voter = getOrCreateDelegateWithNullOption(event.params.voter.toHexString(), false);

  // Check if the voter was a delegate already accounted for, if not we should log an error
  // since it shouldn't be possible for a delegate to vote without first being 'created'
  if (voter == null) {
    log.error('Delegate {} not found on VoteCast. tx_hash: {}', [
      event.params.voter.toHexString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  // Create it anyway since we will want to account for this event data, even though it should've never happened
  voter = getOrCreateDelegate(event.params.voter.toHexString());

  vote.proposal = proposal.id;
  vote.voter = voter.id;
  vote.votesRaw = event.params.votes;
  vote.votes = event.params.votes;
  vote.support = event.params.support == 1;
  vote.supportDetailed = event.params.support;
  vote.nouns = voter.nounsRepresented;
  vote.blockNumber = event.block.number;

  if (event.params.reason != '') {
    vote.reason = event.params.reason;
  }

  vote.save();

  if (event.params.support == 0) {
    proposal.againstVotes = proposal.againstVotes.plus(event.params.votes);
  } else if (event.params.support == 1) {
    proposal.forVotes = proposal.forVotes.plus(event.params.votes);
  } else if (event.params.support == 2) {
    proposal.abstainVotes = proposal.abstainVotes.plus(event.params.votes);
  }

  const dqParams = getOrCreateDynamicQuorumParams();
  const usingDynamicQuorum =
    dqParams.dynamicQuorumStartBlock !== null &&
    dqParams.dynamicQuorumStartBlock!.lt(proposal.createdBlock);

  if (usingDynamicQuorum) {
    proposal.quorumVotes = dynamicQuorumVotes(
      proposal.againstVotes,
      proposal.totalSupply,
      proposal.minQuorumVotesBPS,
      proposal.maxQuorumVotesBPS,
      proposal.quorumCoefficient,
    );
  }

  if (proposal.status == STATUS_PENDING) {
    proposal.status = STATUS_ACTIVE;
  }
  proposal.save();
}
