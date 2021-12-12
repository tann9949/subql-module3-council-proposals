import {SubstrateEvent} from "@subql/types";
import {Councillor, VoteHistory, Proposal} from "../types";
import { bool, Int } from "@polkadot/types";
import {Balance} from "@polkadot/types/interfaces";


async function ensureCouncillor(accountId: string): Promise<void> {
    // ensure account entities exist
    let councillor = await Councillor.get(accountId);
    if (!councillor) {
        // if not exists
        councillor = new Councillor(accountId);
        councillor.numberOfVotes = 0
    }
    councillor.numberOfVotes += 1
    await councillor.save()
}


export async function handleCouncilProposedEvent(event: SubstrateEvent): Promise<void> {
    const [accountId, proposal_index, proposal_hash, threshold] = event.event.data;
    // add proposal entity
    const proposal = new Proposal(proposal_hash.toString())
    proposal.index = proposal.index.toString()
    proposal.account = accountId.toString()
    proposal.hash = proposal_hash.toString()
    proposal.voteThreshold = threshold.toString()
    proposal.block = event.block.block.header.number.toBigInt()
    await proposal.save()
}


export async function handleCouncilVotedEvent(event: SubstrateEvent): Promise<void> {
    const [councilorId, proposal_hash, approved_vote, numberYes, numberNo] = event.event.data
    await ensureCouncillor(councilorId.toString())
    const voteHistory = new VoteHistory(
        `${event.block.block.header.number.toNumber()}-${event.idx}`
    )
    voteHistory.proposalHashId = proposal_hash.toString()
    voteHistory.approvedVote = (approved_vote as bool).valueOf()
    voteHistory.councillorId = councilorId.toString()
    voteHistory.votedYes = (numberYes as Int).toNumber()
    voteHistory.votedNo = (numberNo as Int).toNumber()
    voteHistory.block = event.block.block.header.number.toNumber()

    await voteHistory.save()
}


