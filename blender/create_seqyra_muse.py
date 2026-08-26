import bpy
import math
from mathutils import Vector

OUT_BLEND = r"C:\Users\joymu\Documents\Codex\2026-08-27\https-youtu-be-iuj-tae-e4c\outputs\seqyra_muse.blend"
OUT_RENDER = r"C:\Users\joymu\Documents\Codex\2026-08-27\https-youtu-be-iuj-tae-e4c\outputs\seqyra-muse-4k.png"

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name, color, metallic=0.0, rough=0.4, emission=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    nodes = m.node_tree.nodes
    nodes.clear()
    bs = nodes.new('ShaderNodeBsdfPrincipled')
    out = nodes.new('ShaderNodeOutputMaterial')
    m.node_tree.links.new(bs.outputs['BSDF'], out.inputs['Surface'])
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Metallic'].default_value = metallic
    bs.inputs['Roughness'].default_value = rough
    if emission:
        bs.inputs['Emission Color'].default_value = (*emission, 1)
        bs.inputs['Emission Strength'].default_value = strength
    return m

PINK = mat('Sakura lacquer', (0.95, 0.17, 0.48), 0.35, 0.22)
LIGHT_PINK = mat('Pearl pink', (1.0, 0.55, 0.72), 0.2, 0.25)
SKIN = mat('Warm porcelain', (1.0, 0.63, 0.67), 0.0, 0.5)
DARK = mat('Wine carbon', (0.045, 0.012, 0.03), 0.55, 0.19)
WHITE = mat('Pearl white', (0.94, 0.86, 0.91), 0.35, 0.18)
BLUE = mat('Ice hologram', (0.08, 0.55, 1.0), 0.15, 0.16, (0.05, 0.5, 1.0), 5.0)
GLOW = mat('Pink energy', (1.0, 0.03, 0.34), 0.15, 0.12, (1.0, 0.02, 0.25), 7.0)
EYE = mat('Eye glow', (0.2, 0.02, 0.12), 0.0, 0.1, (1.0, 0.08, 0.45), 3.5)

def smooth(obj):
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons: p.use_smooth = True
    return obj

def uv(name, loc, scale, material, seg=64, rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(o); o.data.materials.append(material); return o

def cube(name, loc, scale, material, bevel=0.12, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    b=o.modifiers.new('soft edges','BEVEL'); b.width=bevel; b.segments=4
    o.data.materials.append(material); return o

def cyl(name, a, b, radius, material):
    a,b=Vector(a),Vector(b); d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=d.length, location=(a+b)/2)
    o=bpy.context.object; o.name=name; o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y')
    smooth(o); o.data.materials.append(material); return o

def torus(name, loc, major, minor, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=96, minor_segments=16, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; smooth(o); o.data.materials.append(material); return o

def cone(name, loc, r1, r2, depth, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=r1, radius2=r2, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; smooth(o); o.data.materials.append(material); return o

def curve(name, points, bevel, material):
    cu=bpy.data.curves.new(name,'CURVE'); cu.dimensions='3D'; cu.bevel_depth=bevel; cu.bevel_resolution=5
    sp=cu.splines.new('BEZIER'); sp.bezier_points.add(len(points)-1)
    for bp,co in zip(sp.bezier_points,points):
        bp.co=co; bp.handle_left_type='AUTO'; bp.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,cu); bpy.context.collection.objects.link(o); o.data.materials.append(material); return o

# Full-body stylized cyber muse.
uv('head',(0,0,3.85),(0.72,0.62,0.78),SKIN)
uv('neck',(0,0,3.12),(0.26,0.24,0.42),SKIN)
cone('torso',(0,0,2.35),0.72,0.48,1.55,DARK)
cone('skirt',(0,0,1.42),1.08,0.57,1.18,PINK)
torus('waist_energy',(0,0,1.92),0.62,0.045,GLOW)

# Face and eyes.
for sx in (-1,1):
    uv('eye', (0.25*sx,-0.57,3.98),(0.13,0.055,0.2),EYE,32,16)
    uv('cheek',(0.34*sx,-0.585,3.68),(0.13,0.025,0.06),LIGHT_PINK,32,16)
curve('smile',[(-0.16,-0.625,3.58),(0,-0.66,3.52),(0.16,-0.625,3.58)],0.022,DARK)

# Hair cap, bangs, and long flowing locks.
uv('hair_cap',(0,0.09,4.17),(0.78,0.68,0.78),PINK)
for i,x in enumerate((-0.55,-0.34,-0.14,0.08,0.30,0.52)):
    curve(f'bang_{i}',[(x,-0.55,4.46),(x*0.85,-0.72,4.05),(x*0.62,-0.64,3.72)],0.10 if i not in (0,5) else 0.08,LIGHT_PINK)
for i,(sx,zoff) in enumerate(((-1,0),(1,.08),(-1,.18),(1,.25),(-1,.34),(1,.42))):
    x=0.55*sx
    curve(f'long_hair_{i}',[(x,0.12,4.35),(0.92*sx,0.22,3.48),(0.88*sx,0.15,2.35),(0.66*sx,0.05,1.15+zoff)],0.16 if i<2 else 0.11,PINK if i%2==0 else LIGHT_PINK)

# Cat ears.
for sx in (-1,1):
    cone('cat_ear',(0.47*sx,0.05,4.94),0.33,0.02,0.78,PINK,rot=(0.12*sx,0,0.12*sx))
    cone('ear_light',(0.47*sx,-0.06,4.94),0.18,0.01,0.50,GLOW,rot=(0.12*sx,0,0.12*sx))

# Arms in a confident open pose, gloves and hands.
cyl('arm_L',(-0.52,0,2.78),(-1.05,-0.08,2.05),0.18,SKIN)
cyl('arm_R',(0.52,0,2.78),(1.02,-0.10,2.30),0.18,SKIN)
cyl('forearm_L',(-1.05,-0.08,2.05),(-0.76,-0.42,1.60),0.16,DARK)
cyl('forearm_R',(1.02,-0.10,2.30),(1.18,-0.48,3.02),0.16,DARK)
uv('hand_L',(-0.76,-0.43,1.55),(0.22,0.16,0.24),SKIN)
uv('hand_R',(1.18,-0.50,3.08),(0.22,0.16,0.24),SKIN)
torus('wrist_L',(-0.94,-0.26,1.82),0.19,0.035,BLUE,rot=(0.75,0.2,0.3))
torus('wrist_R',(1.10,-0.32,2.65),0.19,0.035,GLOW,rot=(0.4,-0.1,-0.2))

# Legs and boots.
for sx in (-1,1):
    cyl('thigh',(0.42*sx,0,1.18),(0.46*sx,0,0.25),0.28,DARK)
    cyl('shin',(0.46*sx,0,0.25),(0.50*sx,-0.05,-0.72),0.23,WHITE)
    cube('boot',(0.50*sx,-0.18,-0.93),(0.30,0.48,0.22),DARK,0.16)
    torus('boot_ring',(0.50*sx,0,-0.48),0.25,0.035,GLOW,rot=(0,0,0))

# Chest reactor and shoulder tech.
torus('reactor',(0,-0.63,2.48),0.24,0.055,BLUE,rot=(math.pi/2,0,0))
uv('reactor_core',(0,-0.66,2.48),(0.17,0.055,0.17),BLUE,32,16)
for sx in (-1,1):
    cube('shoulder_plate',(0.63*sx,-0.02,2.78),(0.30,0.34,0.14),PINK,0.12,rot=(0.15,0.12*sx,0.18*sx))

# Floating holographic orbit rings and particles.
torus('halo_back',(0,0.44,2.35),1.85,0.022,GLOW,rot=(math.pi/2,0.08,0.18))
torus('halo_side',(0.12,0.1,2.48),1.48,0.018,BLUE,rot=(math.pi/2,0.55,0))
for i in range(22):
    a=i*math.tau/22; r=1.72 + 0.12*math.sin(i*1.7); z=2.25+0.72*math.sin(a*1.4)
    uv('spark',(r*math.cos(a),0.35+r*0.12*math.sin(a),z),(0.035,0.035,0.035),GLOW if i%3 else BLUE,16,8)

# Ground shadow disc.
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=1.3, depth=0.08, location=(0,0,-1.17))
base=bpy.context.object; base.data.materials.append(DARK)
torus('base_glow',(0,0,-1.10),1.34,0.04,GLOW)

# Camera and lighting.
bpy.ops.object.camera_add(location=(7.4,-13.8,4.1))
cam=bpy.context.object; bpy.context.scene.camera=cam
def track(obj, target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
track(cam,(0,0,1.85)); cam.data.lens=66

bpy.ops.object.light_add(type='AREA', location=(-4,-6,7)); key=bpy.context.object; key.data.energy=1150; key.data.shape='DISK'; key.data.size=5.0; key.data.color=(1.0,0.22,0.46); track(key,(0,0,2))
bpy.ops.object.light_add(type='AREA', location=(4,-2,5)); fill=bpy.context.object; fill.data.energy=900; fill.data.size=4; fill.data.color=(0.15,0.55,1.0); track(fill,(0,0,2.2))
bpy.ops.object.light_add(type='AREA', location=(0,4,6)); rim=bpy.context.object; rim.data.energy=1300; rim.data.size=3; rim.data.color=(1.0,0.12,0.38); track(rim,(0,0,2.6))

scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE'
scene.render.resolution_x=2160; scene.render.resolution_y=3840; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'; scene.render.film_transparent=True
scene.render.filepath=OUT_RENDER
scene.render.image_settings.color_depth='8'
scene.view_settings.look='AgX - Medium High Contrast'
scene.render.resolution_percentage=100

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
bpy.ops.render.render(write_still=True)
print('SEQYRA_RENDER_COMPLETE', OUT_BLEND, OUT_RENDER)
