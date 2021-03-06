
const nodes = new vis.DataSet([]);
const edges = new vis.DataSet([]);
const networkData = {
  nodes: nodes,
  edges: edges
};

let network = null;

let _inverted = false;
const TOP_DOWN = "TOP_DOWN";
const LEFT_RIGHT = "LEFT_RIGHT";
let _layout = TOP_DOWN;
let _settings = false;
let _origData = {
  nodes: [],
  relationships: []
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function initialize() {
  // create a network
  const container = document.getElementById("network");

  const options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    nodes: {
      font: {
        size: 12
      }
    },
    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5
        }
      },
      font: {
        size: 8,
        align: "top"
      },
      smooth: false
    },
    layout: {
      hierarchical: {
        enabled: true,
        direction: "DU",
        sortMethod: "directed"
      }
    },
    physics: {
      enabled: false,
      minVelocity: 0.75,
      solver: "hierarchicalRepulsion"
    },
    configure: false
  };
  network = new vis.Network(container, networkData, options);
  resize();

  network.on("configChange", function () {
    // this will immediately fix the height of the configuration
    // wrapper to prevent unecessary scrolls in chrome.
    // see https://github.com/almende/vis/issues/1568
    const div = container.getElementsByClassName("vis-configuration-wrapper")[0];
    div.style["height"] = div.getBoundingClientRect().height + "px";
  });
  
  document.body.addEventListener("themeChanged", event => {
    applyThemeToNetwork(network, event.detail.newTheme);
  });

  if (!vscode) { populateWithTestData(); }
  ensureLayout();
  onLoad();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleMessage(message) {
  switch (message.command) {
    case 'updateContent':
      updateGraph(message.data);
      break;
    case 'setInverted':
      setInverted(message.value);
      break;
    case 'setOptions':
      setOptions(message.options);
      break;
    default:
      console.log("Unexpected message: " + message.command);
  }

}

function populateWithTestData() {
  // for testing only
  updateGraph({
    nodes: [{ id: 1, label: 'City' }, { id: 2, label: 'Town nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn' }, { id: 3, label: 'Village' }, { id: 4, label: 'Capital' }],
    relationships: [{ from: 1, to: 2 }, { from: 2, to: 3 }, {from: 4, to: 2}]
  });
  setIsInset(true);
}

function clearNetwork() {
  nodes.clear();
  edges.clear();
}

function updateGraph(data) {
  _origData = data;
  clearNetwork();
  if (data.nodes) { nodes.add(data.nodes); }
  edges.add(data.relationships);
  network.fit({animation: true});
}

function resize() {
  const container = document.getElementById("network");
  const visNetwork = container.getElementsByClassName("vis-network")[0];
  const canvas = visNetwork.canvas;
  if (canvas) {
    network.setSize(canvas.style["width"], (window.innerHeight - 6) + "px");
  }
}

/**
 * Sets the `inverted` fag. 
 * @param {boolean} inverted should the direction of the graph layout be inverted?
 */
function setInverted(inverted) {
  _inverted = inverted;
  ensureLayout();
}

function ensureLayout() {
  if (_layout === TOP_DOWN) {
    topDown();
  }
  else if (_layout === LEFT_RIGHT) {
    leftRight();
  }
}

function topDown() {
  _layout = TOP_DOWN;
  setLayoutDirection(_inverted ? 'DU' : 'UD');
}

function leftRight() {
  _layout = LEFT_RIGHT;
  setLayoutDirection(_inverted ? 'RL' : 'LR');
}

function setLayoutDirection(direction) {
  network.setOptions({ layout: { hierarchical: { direction: direction } } });
}

function setOptions(options) {
  network.setOptions(options);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fit() {
  network.fit();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toggleSettings() {
  _settings = !_settings;
  network.setOptions({ configure: _settings });
  document.body.style.overflow = _settings ? 'scroll' : 'hidden';
  if (_settings) {
    const settingsElement = document.getElementsByClassName("vis-configuration-wrapper")[0];
    if (settingsElement) { settingsElement.scrollIntoView(); }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reset() {
  updateGraph(_origData);
}