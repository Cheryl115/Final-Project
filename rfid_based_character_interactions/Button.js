class Button {
  constructor(x, y, w, h, text, onClick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.onClick = onClick;
  }

  display() {
    push();
    // Orange button background
    fill('#F7C385');
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);
    
    // Black text
    fill(0);
    textFont('American Typewriter');
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.text, this.x + this.w/2, this.y + this.h/2);
    pop();
  }

  isMouseOver() {
    return mouseX > this.x && mouseX < this.x + this.w && 
           mouseY > this.y && mouseY < this.y + this.h;
  }

  handleClick() {
    if (this.isMouseOver() && this.onClick) {
      this.onClick();
    }
  }
}

class ResultButton {
  constructor(x, y, w, h, text, onClick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.onClick = onClick;
  }

  display() {
    push();
    // Button background
    fill('#F7C385');
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);

    // Button text
    fill(0);
    textSize(16);
    textFont('American Typewriter');
    textAlign(CENTER, CENTER);
    text(this.text, this.x + this.w/2, this.y + this.h/2);
    pop();
  }

  handleClick() {
    if (mouseX >= this.x && mouseX <= this.x + this.w &&
        mouseY >= this.y && mouseY <= this.y + this.h) {
      this.onClick();
    }
  }
} 