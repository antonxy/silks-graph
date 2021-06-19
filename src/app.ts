import cytoscape from 'cytoscape';

import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use(coseBilkent);

function graph_to_cyto(graph: any) {
  return graph.positions.map((pos: any) => ({
    group: 'nodes',
    data: { id: 'p' + pos.id, name: pos.name, image: pos.image }
  })).concat(
    graph.actions.map((act: any) => ({
      group: 'edges',
      data: { id: 'a' + act.id, name: act.name, source: 'p' + act.from, target: 'p' + act.to, video: act.video }
    })));
}

var cy = cytoscape({

  container: document.getElementById('cy'), // container to render in

  elements: fetch("media/graph.json").then(response => response.json()).then(graph_to_cyto),

  style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(name)'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(name)',
        'text-rotation': ('autorotate' as any),
        "arrow-scale": 2,
      }
    },

    {
      selector: ":selected",
      style: {
        "background-color": "green",
        "line-color": "green",
      }
    }
  ],

  layout: ({
    //name: 'breadthfirst',
    name: 'cose-bilkent',
    nodeDimensionsIncludeLabels: true,
    idealEdgeLength: 200,
  } as any),

  selectionType: 'single',

});

function scrollToSidebar() {
  document!.getElementById('sidebar')!.scrollIntoView({ behavior: 'smooth' });
}
function scrollToGraph() {
  document!.getElementById('cy')!.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('scroll-down')?.addEventListener('click', scrollToSidebar);
document.getElementById('scroll-up')?.addEventListener('click', scrollToGraph);

function update_sidebar(title: string, image?: string, video?: string) {
  document.getElementById('action-name')!.innerHTML = title;
  var image_elm = document.getElementById('action-img') as HTMLImageElement
  if (image) {
    image_elm.src = "media/images/" + image;
    image_elm.style.display = "block";
  } else {
    image_elm.src = "";
    image_elm.style.display = "none";
  }
  var video_elm = document.getElementById('action-video') as HTMLVideoElement;
  if (video) {
    video_elm.src = "media/videos/" + video;
    video_elm.style.display = "block";
    video_elm.play();
  } else {
    video_elm.src = "";
    video_elm.style.display = "none";
  }

  if (video || image) {
    scrollToSidebar();
  }
}

cy.on('tap', 'node', function (evt) {
  var node = evt.target.data();
  update_sidebar(node.name, node.image, undefined);
});

cy.on('tap', 'edge', function (evt) {
  var edge = evt.target.data();
  update_sidebar(edge.name, undefined, edge.video);
});

//
// Graph Editing
//

document.getElementById('add-node')?.addEventListener('click', function () {
  cy.add({
    group: 'nodes',
    data: { id: 'ptest', name: "Test Node" }
  });
});

document.getElementById('add-edge')?.addEventListener('click', function () {
  const selected = cy.nodes(":selected");
  if (selected.length != 2) {
    alert("Have to select two nodes to connect by edge");
    return;
  }
  var node1 = selected[0].data();
  var node2 = selected[1].data();
  cy.add({
    group: 'edges',
    data: { id: 'atest', name: "Test edge", source: node1.id, target: node2.id }
  });
});

document.getElementById('save')?.addEventListener('click', function () {
  console.log(cy.json());
});

//
// Sequence
//

function addStep(edge: any) {
  var newElm = document.createElement('li');
  newElm.setAttribute('action-id', edge.id);

  var link = document.createElement('a');
  link.innerHTML = edge.name;
  link.addEventListener('click', function () {
    update_sidebar(edge.name, undefined, edge.video);
  });
  newElm.appendChild(link);

  var removeButton = document.createElement('button');
  removeButton.innerHTML = 'x';
  removeButton.addEventListener('click', function () {
    newElm.remove();
  });
  newElm.appendChild(removeButton);

  document.getElementById('steps')?.appendChild(newElm);
}

document.getElementById('add-step')?.addEventListener('click', function () {
  var edge = cy.edges(":selected").first().data();
  addStep(edge);
});

document.getElementById('share-link')?.addEventListener('click', function () {
  let txt = "";
  let ch = document.getElementById('steps')?.children!;
  for (let i = 0; i < ch.length; i++) {
    let chi = ch[i];
    txt += chi.getAttribute('action-id');
    if (i < ch.length - 1) {
      txt += ":";
    }
  }
  let url = window.location.href.split('?')[0] + "?seq=" + txt;
  let txtfield = document.getElementById('share-url') as HTMLInputElement;
  txtfield.setAttribute('value', url);

  txtfield.select();
  txtfield.setSelectionRange(0, 99999);
  document.execCommand("copy");

});

// Load sequence from url
cy.on('ready', function (evt) {
  let url = location.search;
  let query = url.substr(1);
  let result = {};
  query.split("&").forEach(function(part) {
    let item = part.split("=");
    let key = item[0];
    let value = decodeURIComponent(item[1]);
    if (key == 'seq') {
      value.split(":").forEach(function(part) {
        let edge = cy.edges('[id="' + part + '"]').first().data();
        addStep(edge);
      });
    }
  });
});