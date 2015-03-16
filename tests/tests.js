describe("Init", function() {
  beforeAll(function() {
    loadDefaultNetwork("../files/smokerBronchitis.json")
  });

  it("should access correct height, radius, pressed key values", function() {
    // console.log(height);
    // expect(height).toBeDefined();
    expect(height).not.toBeNull();
    // expect(height).toEqual(0.7 * window.innerHeight);
  }); 
});

describe("Node", function() {

  beforeAll(function() {
    nodeMode = true;
  });

  it("should access correct height and radius vals", function() {
    expect(height).toBeDefined();
    // expect(height).toEqual(450);
    expect(radius).toBeDefined();
    expect(radius).toEqual(20);
  });

  it("should have svg setup", function() {
    expect(svg).toBeDefined();
    expect(svg).not.toBeNull();
  });

  it("should have initiated with refresh()", function() {
    expect(refresh).toBeDefined();
    // expect(lastID).toEqual(1);
  });

  it("should be able to create a node", function() {
    // expect(nodes[nodes.length-1].title).toEqual("Bronchitis");
    addNewNode(true);
    // expect(lastID).toEqual(2);
    expect(nodes[nodes.length-1].title).toEqual("New Node");
  });
});