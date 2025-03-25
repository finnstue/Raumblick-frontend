import { Canvas, invalidate, useLoader, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Sphere,
  Points,
  PointMaterial,
  Stats,
  Bvh,
  Html,
  Splat,
  Line,
} from '@react-three/drei';
import { div, PLYLoader } from 'three/examples/jsm/Addons.js';
import { useState, useMemo, useRef } from 'react';
import * as THREE from 'three';

function Mesh({ path, onClick, onPointerMove, fast = false }) {
  const obj = useLoader(PLYLoader, path);

  obj.center();

  if (fast) {
    return (
      <mesh geometry={obj} onClick={onClick} onPointerMove={onPointerMove}>
        <meshBasicMaterial vertexColors={true} />
      </mesh>
    );
  }

  return (
    <Bvh firstHitOnly>
      <mesh geometry={obj} onClick={onClick} onPointerMove={onPointerMove}>
        <meshBasicMaterial vertexColors={true} />
      </mesh>
    </Bvh>
  );
}

function CustomCanvas({
  children,
  initialPosition = [0, -2, 2],
  farPlane = 100,
  fov = 75,
}) {
  return (
    <Canvas
      camera={{
        position: initialPosition,
        far: farPlane,
        near: 0.01,
        up: [0, 0, 1],
        fov: fov,
      }}
      frameloop='demand'
    >
      <OrbitControls
        zoomSpeed={0.5}
        dampingFactor={0.3}
        minDistance={0.2}
        maxDistance={4}
      />
      {children}
    </Canvas>
  );
}

function Note({ position, text, isOpen, onChange, onToggle, onDelete }) {
  // Add a ref to track if we're deleting
  const isDeleting = useRef(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onToggle();
    } else if (e.key === 'Backspace' && e.metaKey) {
      isDeleting.current = true; // Set flag before delete
      onDelete();
    }
  };

  const handleBlur = () => {
    // Only call onToggle if we're not deleting
    if (!isDeleting.current) {
      onToggle();
    }
    // Reset the flag
    isDeleting.current = false;
  };

  return (
    <Html position={position} center>
      {isOpen ? (
        <div className='relative'>
          <textarea
            style={{
              width: '8em',
              height: '6em',
              resize: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontFamily: 'sans-serif',
              fontSize: '14px',
              color: '#333',
              lineHeight: 1,
              outline: 'none', // Remove default focus outline
            }}
            className='bg-yellow-200'
            autoFocus
            placeholder='Enter text...'
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            value={text}
          />
        </div>
      ) : (
        <div
          className='bg-yellow-200 cursor-pointer font-bold'
          style={{
            height: '20px',
            maxWidth: '4em',
            overflow: 'hidden',
            lineHeight: '16px',
            fontSize: '12px',
            padding: '2px 4px',
            borderRadius: '4px',
          }}
          onClick={onToggle}
        >
          {text || 'Note'}
        </div>
      )}
    </Html>
  );
}

export function SpatialView({ meshPath, notes_, measurements_ }) {
  const [notes, setNotes] = useState(notes_);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [fixedMeasurements, setFixedMeasurements] = useState(measurements_);

  const onClick = (e) => {
    if (e.delta > 3) return;

    if (isMeasuring) {
      setEndPosition(e.point);
      setIsMeasuring(false);
      setFixedMeasurements([
        ...fixedMeasurements,
        {
          start: startPosition,
          end: endPosition,
        },
      ]);
      setStartPosition(null);
      setEndPosition(null);
    }

    if (e.metaKey) {
      setNotes([
        ...notes,
        {
          id: crypto.randomUUID(),
          position: e.point,
          text: '',
          isOpen: true,
        },
      ]);
      return;
    } else if (e.shiftKey) {
      setStartPosition(e.point);
      setIsMeasuring(true);
    }
  };

  const handleNoteChange = (id, text) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, text } : note)));
  };

  const handleNoteToggle = (id) => {
    setNotes(
      notes
        .map((note) =>
          note.id === id ? { ...note, isOpen: !note.isOpen } : note
        )
        .filter((note) => note.text !== '')
    );
  };

  const handleNoteDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handlePointerMove = (e) => {
    setEndPosition(e.point);
    invalidate();
  };

  return (
    <CustomCanvas showAxes={false} fov={75}>
      <Mesh
        path={meshPath}
        onClick={onClick}
        onPointerMove={isMeasuring ? handlePointerMove : null}
        fast={true}
      />
      {notes.map((note) => (
        <Note
          key={note.id}
          position={note.position}
          text={note.text}
          isOpen={note.isOpen}
          onChange={(text) => handleNoteChange(note.id, text)}
          onToggle={() => handleNoteToggle(note.id)}
          onDelete={() => handleNoteDelete(note.id)}
        />
      ))}
      {startPosition !== null && (
        <Sphere position={startPosition} scale={0.01} renderOrder={2}>
          <meshBasicMaterial color='black' />
        </Sphere>
      )}
      {endPosition !== null && (
        <Sphere position={endPosition} scale={0.01} renderOrder={2}>
          <meshBasicMaterial color='black' />
        </Sphere>
      )}
      {startPosition !== null && endPosition !== null && (
        <Line
          points={[startPosition, endPosition]}
          color='red'
          linewidth={2}
          renderOrder={1}
          depthTest={false}
        />
      )}
      {startPosition !== null && endPosition !== null && (
        <Html position={startPosition.clone().lerp(endPosition, 0.5)} center>
          <div
            className='bg-gray-200 font-bold'
            style={{
              lineHeight: '16px',
              fontSize: '12px',
              padding: '2px 4px',
              borderRadius: '4px',
            }}
          >
            {Math.round(startPosition.distanceTo(endPosition) * 100) / 100}m
          </div>
        </Html>
      )}
      {fixedMeasurements.map((measurement, index) => (
        <group key={index}>
          <Html
            position={measurement.start.clone().lerp(measurement.end, 0.5)}
            center
          >
            <div
              className='bg-gray-200 font-bold'
              style={{
                lineHeight: '16px',
                fontSize: '12px',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
              onDoubleClick={() => {
                setFixedMeasurements(
                  fixedMeasurements.filter((_, i) => i !== index)
                );
              }}
            >
              {Math.round(measurement.start.distanceTo(measurement.end) * 100) /
                100}
              m
            </div>
          </Html>
          <Line
            points={[measurement.start, measurement.end]}
            color='gray'
            linewidth={2}
            renderOrder={1}
            depthTest={false}
          />
          <Sphere position={measurement.start} scale={0.01} renderOrder={2}>
            <meshBasicMaterial color='black' />
          </Sphere>
          <Sphere position={measurement.end} scale={0.01} renderOrder={2}>
            <meshBasicMaterial color='black' />
          </Sphere>
        </group>
      ))}
    </CustomCanvas>
  );
}
