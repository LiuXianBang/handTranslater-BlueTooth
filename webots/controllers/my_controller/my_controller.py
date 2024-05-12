import math
from controller import Robot, Motor


TIME_STEP = 32

robot = Robot()
motor1 = robot.getDevice("rm1")
motor2 = robot.getDevice("rm2")
F = 2.0   # frequency 2 Hz
t = 0.0   # elapsed simulation time

while robot.step(TIME_STEP) != -1:
    # position = sin(t * 2.0 * pi * F)
    # motor.setPosition( sin(t * 2.0 * pi * F))
    motor1.setPosition(math.radians(60))
    motor2.setPosition(math.radians(60))
    t += TIME_STEP / 1000.0