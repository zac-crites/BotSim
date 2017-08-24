var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;

var engine = Engine.create();

var render = Render.create({
    element: document.getElementById("renderelement"),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight
    }
});

var updates = [];
var bodies = [
    Bodies.rectangle(400, 610, 10000, 60, { isStatic: true, friction : 1, frictionStatic : 100 }),
    Bodies.circle(800, 1100, 600, { isStatic: true, friction :1 , frictionStatic : 100 }),
    Bodies.rectangle(950, 400, 100, 100, { friction :1 , frictionStatic : 100  })
];

var amp = .25;
var defaultMachine = {
    nodes: [
        [100, 100],
        [200, 50],
        [300, 100],
        [200, 150],
        [100, 200],
        [100, 200],
        [300, 200],
        [300, 200]],
    edges: [[0, 1], [1, 2], [1, 2], [1, 3], [0, 3], [2, 3], [0, 4], [3, 4], [0, 5], [3, 5], [2, 6], [3, 6], [2, 7], [3, 7]],
    muscles: [
        {
            edge: 6,
            phase: .25,
            amplitude: amp
        },
        {
            edge: 7,
            phase: 0,
            amplitude: amp
        },
        {
            edge: 8,
            phase: .75,
            amplitude: amp
        },
        {
            edge: 9,
            phase: .5,
            amplitude: amp
        },
        {
            edge: 10,
            phase: .25,
            amplitude: amp
        },
        {
            edge: 11,
            phase: .5,
            amplitude: amp
        },
        {
            edge: 12,
            phase: .75,
            amplitude: amp
        },
        {
            edge: 13,
            phase: 0,
            amplitude: amp
        },
    ]
};

var machineCount = 0;

function buildMachine(machine, offset, period) {

    var collisionFilter = machineCount++;
    var nodeBodies = [];
    var edgeConstraints = [];

    machine.nodes.forEach(function (node, index) {
        let body = Bodies.circle(node[0] + offset[0], node[1] + offset[1], 10, {
            inertia: Infinity,
            friction: 1 ,
            frictionStatic : 100,
            collisionFilter: {
                group: -machineCount
            }
        }, 20);
        nodeBodies.push(body);
        bodies.push(body);
    });

    machine.edges.forEach(function (edge, index) {
        let constraint = Matter.Constraint.create({
            bodyA: nodeBodies[edge[0]],
            bodyB: nodeBodies[edge[1]],
            damping: .1,
            stiffness : .1,
            length: edge[3],
        });
        constraint.render.type = 'line';

        edgeConstraints.push(constraint);
        bodies.push(constraint);
    });

    machine.muscles.forEach(function (muscle) {
        var constraint = edgeConstraints[muscle.edge];
        var baseLength = constraint.length;

        updates.push((timestamp) => {
            var t = (timestamp % period) / period;
            var factor = Math.sin(2 * Math.PI * (t + muscle.phase));
            constraint.length = baseLength + (baseLength * muscle.amplitude * factor);
        });
    });
};

Events.on(engine, 'beforeUpdate', function (event) {
    var engine = event.source;
    var period = 5000;

    updates.forEach(function (update) {
        update(event.timestamp);
    });
});

buildMachine(defaultMachine, [100, 100], 2000);
buildMachine(defaultMachine, [400, 100], 1000);

World.add(engine.world, bodies);

Engine.run(engine);

Render.run(render);

Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 1300, y: 600 }
});