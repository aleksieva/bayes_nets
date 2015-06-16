var startTour = function() {
 
    var tour = new Tour({
        //TODO change to local storage??
        storage : false,
        onStart : function(tour) {
          loadDefaultNetwork("files/burglaryNet.json", true);
        }     
    });
 
    tour.addSteps([
      {
        element: ".tour-step.tour-step-zero",
        placement: "bottom",
        orphan: true,
        backdrop:true ,
        title: "Welcome to the Bayesian Networks tutorial!",
        content: "This tour will guide you through the main features of the tool."
      },
      {
        element: ".tour-step.tour-step-two",
        placement: "right",
        title: "Controls",
        content: "From here you can control the mode you are currently in, download, upload and sample networks."
      },
      {
        element: ".tour-step.tour-step-three",
        placement: "top",
        title: "Work field",
        content: "This is the work field where you can add, edit and delete elements."
      },
      {
        element: ".tour-step.tour-step-four",
        placement: "left",
        title: "Information field",
        content: "This is the information field from where you can edit node properties and get info about the state of the network."
      },
      {
        element: ".tour-step.tour-step-zoom",
        placement: "top",
        title: "Zooming Scale",
        content: "Indicator for the current zooming scale. To zoom in and out, scroll into the work field.",
        reflex: true,
        onShow: function(tour) {
          d3.select("#zoom-scale")
            .classed("tour-step tour-step-zoom", true);
        },                        
      },            
      {
        element: ".tour-step.tour-step-five",
        placement: "right",
        backdrop: true,
        title: "Adding Node",
        content: "Click to go into Add Node mode.",
        reflex: true,
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        }        
      },
      {
        element: ".tour-step.tour-step-six",
        placement: "right",
        title: "Adding Node",
        content: "Click to add a node on the field.",
        reflex: true,
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },
        onPrev: function(tour) {
          setMode("");
        }              
      },
      {
        element: ".tour-step.tour-step-seven",
        placement: "top",
        title: "Renaming Node",
        content: "Shift-Click on the node the change its title. Change the title to 'MaryCalls'",
        onShow: function(tour) {
          var selection = d3.selectAll("g.node");
          selection.filter(function(d, i) {return d.title === "New Node"})
                   .classed("tour-step tour-step-seven", true);
        },                        
      },
      {
        element: ".tour-step.tour-step-eight",
        placement: "right",
        backdrop: true,
        title: "Adding Link",
        content: "Click to go into Add Link mode.",
        reflex: true,
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },                
      },
      {
        element: ".tour-step.tour-step-six",
        placement: "top",
        title: "Adding Link",
        content: "Drag from the 'Alarm' node to 'MaryCalls' node to add a connection between them.",
        onPrev: function(tour) {
          setMode("");
        }                      
      },      
      {
        element: ".tour-step.tour-step-nine",
        placement: "right",
        backdrop:true,
        title: "Editing Node",
        content: "Click to go into Edit Node mode.",
        reflex: true,
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },              
      },
      {
        element: ".tour-step.tour-step-seven",
        placement: "top",
        title: "Editing Node",
        content: "Click on the node to edit its properties.",
        reflex: true,
        onShow: function(tour) {
          selectedNode = null;
        },
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },
        onPrev: function(tour) {
          setMode("");
        }                           
      },
      {
        element: ".tour-step.tour-step-ten",
        placement: "left",
        title: "Explore Node Properties",
        content: "Choose 'Node Values' from the dropdown to explore this node values.",
        onShow: function(tour) {
          d3.select("#node-options")
            .classed("tour-step tour-step-ten", true);
        },              
      },
      {
        element: ".tour-step.tour-step-ten",
        placement: "left",
        title: "Explore Node Properties",
        content: "Go back to CPT table.",
        onShow: function(tour) {
          d3.select("#node-options")
            .classed("tour-step tour-step-ten", true);
        },              
      },
      {
        element: ".tour-step.tour-step-eleven",
        placement: "left",
        title: "Explore Node Properties",
        content: "Edit the CPT values for 'MaryCalls' to being <0.7, 0.3>, <0.01, 0.99>.",
        onShow: function(tour) {
          d3.select(".cpt-table")
            .classed("tour-step tour-step-eleven", true);
        },              
      },
      {
        element: ".tour-step.tour-step-twelve",
        placement: "left",
        title: "Explore Node Properties",
        content: "Click 'Update CPT' button to save your changes.",
        reflex: true,
        onShow: function(tour) {
          d3.select("#cpt-update-btn")
            .classed("tour-step tour-step-twelve", true);
        },
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },               
      },
      {
        element: ".tour-step.tour-step-success",
        placement: "left",
        title: "Explore Node Properties",
        content: "Message on the result of your update.",
        onShow: function(tour) {
          d3.select(".alert-text")
            .classed("tour-step tour-step-success", true);
        },               
      },            
      {
        element: ".tour-step.tour-step-thirteen",
        placement: "right",
        backdrop:true,
        title: "Sampling from Network",
        content: "Click to start sampling from the network.",
        reflex: true,
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },
        onPrev: function(tour) {
          if(!editNodeMode) {
            setMode("edit");
          }
        }                        
      },
      {
        element: ".tour-step.tour-step-fourteen",
        placement: "left",
        title: "Sampling from Network",
        content: "To use the sampling as a classifier, fix all the values except one.",
        onShow: function(tour) {
          d3.select("#fixed-sampling-div")
            .classed("tour-step tour-step-fourteen", true);
        },
        onPrev: function(tour) {
          setMode("");
        }               
      },
      {
        element: ".tour-step.tour-step-fifteen",
        placement: "bottom",
        title: "Sampling from Network",
        content: "Choose number of samples and click 'Run' to sample.",
        reflex: true,
        onShow: function(tour) {
          d3.select("#runSamplingBtn")
            .classed("tour-step tour-step-fifteen", true);
        },         
        onShown: function(tour) {
          $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        },              
      },
      {
        element: ".tour-step.tour-step-sixteen",
        placement: "left",
        title: "Sampling from Network",
        content: "Click 'Resample' button to generate a different sample with the same size.",
        onShow: function(tour) {
          d3.select("#resample")
            .classed("tour-step tour-step-sixteen", true);
        },                     
      },      
      {
        element: ".tour-step.tour-step-seventeen",
        placement: "bottom",
        title: "Sampling from Network",
        content: "Click 'Download' button to download the sample data in '.csv' format.",
        onShow: function(tour) {
          d3.select("#sampleDownloadBtn")
            .classed("tour-step tour-step-seventeen", true);
        },                      
      },
      {
        element: ".tour-step.tour-step-eighteen",
        placement: "bottom",
        title: "Downloading Network",
        content: "Click 'Download Network' button to save the network for future use.",
        // reflex: true,        
        // onShown: function(tour) {
        //   $(".popover.tour-tour .popover-navigation .btn-group .btn[data-role=next]").prop("disabled", true);
        // },              
      },
      {
        element: ".tour-step.tour-step-twenty",
        placement: "bottom",
        orphan: true,
        backdrop: true,
        title: "Thank you.",
        content: "Have fun exploring the features of the tool.",
      },                    
    ]);
 
    // Initialize the tour
    tour.init();
 
    // Start the tour
    tour.start();
 
};

d3.select("#tutorial")
  .on("click", function() {
    // loadDefaultNetwork();
    startTour();
  });