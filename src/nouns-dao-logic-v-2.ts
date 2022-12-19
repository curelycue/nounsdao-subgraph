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
