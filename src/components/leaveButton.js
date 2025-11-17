// remove groupID from userID
leaveButton.addEventListener("click", function (event) {
const deleteGroupRef = doc(db, "users", uid);

   updateDoc(deleteGroupRef, { groupIDs: arrayRemove("name of group string")
  });
});
  
function leaveGroup(){
  
}