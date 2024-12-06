let isHoldingCtrl = false;
let isHoldingAlt = false;

function isHoldingCtrl_keyboardShortcuts() {
  return isHoldingCtrl;
}

document.addEventListener("keydown", function (event) {
  const ctrl = event.ctrlKey || event.metaKey;

  if (ctrl) {
    isHoldingCtrl = true;
  }
  if (event.key === "Alt") {
    isHoldingAlt = true;
  }

  if (ctrl && event.key === "a") {
    event.preventDefault();
    const checkboxes = document.querySelectorAll(".edit-keywords-checkbox");

    const allCheckboxesAreCheckted = Array.from(checkboxes).every(
      (checkbox) => checkbox.checked
    );

    if (allCheckboxesAreCheckted) {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
        toggleSelectRowCheckbox(checkbox.parentElement.parentElement);
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
        toggleSelectRowCheckbox(checkbox.parentElement.parentElement);
      });
    }
  } else if (event.key === "Escape") {
    if (editWindowIsOpen()) {
      requestCloseEditWindow();

      return;
    }

    const checkboxes = document.querySelectorAll(".edit-keywords-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
      toggleSelectRowCheckbox(checkbox.parentElement.parentElement);
    });
  } else if (ctrl && event.key === "e") {
    event.preventDefault();
    console.log("Edit button pressed");
    document.getElementById("edit-selected-videos-keywords-btn").click();
  } else if (ctrl && event.key === "ArrowUp") {
    window.scrollTo({ top: 0, behavior: "auto" });
  } else if (ctrl && event.key === "ArrowDown") {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "auto" });
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "Control" || event.key === "Meta") {
    isHoldingCtrl = false;
  }
  if (event.key === "Alt") {
    isHoldingAlt = false;
  }
});

document.addEventListener("blur", function (event) {
  isHoldingCtrl = false;
  isHoldingAlt = false;

  console.log("blur", event);
});

document.addEventListener("mousedown", function (event) {
  isHoldingCtrl = event.ctrlKey || event.metaKey;
  isHoldingAlt = event.altKey;
});

document.addEventListener("mouseup", function (event) {
  isHoldingCtrl = event.ctrlKey || event.metaKey;
  isHoldingAlt = event.altKey;
});
