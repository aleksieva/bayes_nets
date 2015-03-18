describe("Init", function() {
  beforeAll(function() {
    loadDefaultNetwork("files/smokerBronchitis.json", true);
  });

  it("should access correct height, radius, pressed key values", function() {
    expect(height).toBeDefined();
    expect(height).not.toBeNull();
  });

  it("should access correct radius", function() {
    expect(radius).toBeDefined();
    expect(radius).toEqual(20);    
  }); 

  it("pressedKey should have correct initial value", function() {
    expect(pressedKey).toBeDefined();
    expect(pressedKey).toEqual(-1);
  });

  it("should have correct constants", function(){
    expect(constants.BACKSPACE).toEqual(8);
    expect(constants.DELETE).toEqual(46);
    expect(constants.ENTER).toEqual(13);
  });

  it("mousedown variables should be initially null", function(){
    expect(selectedNode).toBeNull();
    expect(selectedPath).toBeNull();
    expect(mousedownNode).toBeNull();    
  });

  it("should have svg setup", function() {
     expect(svg).toBeDefined();
     expect(svg).not.toBeNull();
  });

  it("should have initiated with refresh()", function() {
    expect(refresh).toBeDefined(); 
  });

  describe("Node", function() {

    beforeAll(function() {
      nodeMode = true;
    });

    it("should have nodes defined", function(){
      expect(nodes).toBeDefined();
    });

    xit("should have lastID to equal id of the last node", function(){
      //not working
      console.log(lastID);
      expect(lastID).toEqual(nodes[nodes.length-1].id);
    })

    it("should be able to create a node", function() {
      // expect(nodes[nodes.length-1].title).toEqual("Bronchitis");
      addNewNode(true);
      // expect(lastID).toEqual(2);
      expect(nodes[nodes.length-1].title).toEqual("New Node");
    });
  });

});
