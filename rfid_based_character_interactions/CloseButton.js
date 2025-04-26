class CloseButton {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.onClick = () => {
      currentPage = "home";
      if (suspectInput) suspectInput.hide();
      if (accuseButton) accuseButton.hide();
    };
  }

  display() {
    push();
    // Draw black circle
    fill(0);
    noStroke();
    circle(this.x, this.y, this.size);
    
    // Draw X
    stroke(255);
    strokeWeight(2);
    let offset = this.size/4;
    line(this.x - offset, this.y - offset, this.x + offset, this.y + offset);
    line(this.x + offset, this.y - offset, this.x - offset, this.y + offset);
    pop();
  }

  isMouseOver() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.size/2;
  }

  handleClick() {
    if (this.isMouseOver()) {
      this.onClick();
    }
  }
} 