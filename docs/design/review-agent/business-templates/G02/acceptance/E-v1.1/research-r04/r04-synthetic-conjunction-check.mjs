#!/usr/bin/env node
// G02 r04 S-CLOSED independent oracle. NOT CDUT policy, C template, Pi, or D Gold.
import assert from 'node:assert/strict';

const SUBJECT = 'Contractor-Q';
const RESOURCE = 'R1';
function decide({ sponsor, resourceOwner, channel, formalApproval, provisioned, ownerDenied=false }) {
  const pending = [];
  if (ownerDenied) return { status: 'FORMALLY_DENIED', reasons:['OWNER_EXPLICIT_DENIAL'], implementationAllowed:false };
  if (!sponsor) pending.push('PENDING_ROLE_CONFIRMATION');
  if (!resourceOwner) pending.push('PENDING_RESOURCE_OWNER');
  if (!channel || !formalApproval) pending.push('PENDING_APPROVAL');
  if (pending.length) return { status: pending.join(' + '), reasons:pending, implementationAllowed:false };
  if (!provisioned) return { status:'APPROVED_NOT_PROVISIONED', reasons:[], implementationAllowed:false };
  return { status:'PROVISIONED_NETWORK_ONLY', reasons:[], implementationAllowed:true };
}
const cases=[
  {id:'T00', sponsor:false, resourceOwner:false, channel:true, formalApproval:false, provisioned:false, expected:'PENDING_ROLE_CONFIRMATION + PENDING_RESOURCE_OWNER + PENDING_APPROVAL'},
  {id:'T01', sponsor:false, resourceOwner:true,  channel:true, formalApproval:false, provisioned:false, expected:'PENDING_ROLE_CONFIRMATION + PENDING_APPROVAL'},
  {id:'T10-RC04', sponsor:true, resourceOwner:false, channel:true, formalApproval:false, provisioned:false, expected:'PENDING_RESOURCE_OWNER + PENDING_APPROVAL'},
  {id:'T11', sponsor:true, resourceOwner:true, channel:true, formalApproval:false, provisioned:false, expected:'PENDING_APPROVAL'},
  {id:'P-yes-T-no',sponsor:true,resourceOwner:true,channel:true,formalApproval:true,provisioned:false,expected:'APPROVED_NOT_PROVISIONED'},
  {id:'P-yes-T-yes',sponsor:true,resourceOwner:true,channel:true,formalApproval:true,provisioned:true,expected:'PROVISIONED_NETWORK_ONLY'},
  {id:'P-yes-T-yes-but-owner-missing',sponsor:true,resourceOwner:false,channel:true,formalApproval:true,provisioned:true,expected:'PENDING_RESOURCE_OWNER'},
  {id:'explicit-denial',sponsor:true,resourceOwner:false,channel:true,formalApproval:false,provisioned:false,ownerDenied:true,expected:'FORMALLY_DENIED'},
];
const results=cases.map(c=>{
  const {id,expected,...facts}=c;
  const actual=decide(facts);
  // Underlying truth table is conservative: a contradictory claimed approval/provisioning
  // cannot override an absent required resource-owner authorization.
  const pass=actual.reasons.includes(expected) || actual.status===expected;
  assert.equal(pass,true, `${id}: ${actual.status} != ${expected}`);
  return {caseId:id,subject:SUBJECT,resource:RESOURCE,facts,expected,actual:actual.status,implementationAllowed:actual.implementationAllowed,pass};
});
const naiveOrError={caseId:'T10-RC04',naiveIdentityOrOwnerDecision:true||false,requiredConjunctionDecision:true&&false};
assert.equal(naiveOrError.naiveIdentityOrOwnerDecision,true);
assert.equal(naiveOrError.requiredConjunctionDecision,false);
const run={scope:'S-CLOSED independent executable oracle, not product code', projectRuntime:false, goldOpened:false, formalGatePassed:false,passCount:results.filter(x=>x.pass).length,totalCount:results.length,results,naiveOrError};
console.log(JSON.stringify(run,null,2));
